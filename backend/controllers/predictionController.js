import Student from "../models/student.js";
import Attendance from "../models/attendance.js";
import Assignment from "../models/assignment.js";
import Submission from "../models/submission.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_FETCH_TIMEOUT_MS = 20000;
const ML_RETRY_DELAY_MS = 3000;

console.log(`ML service URL: ${ML_SERVICE_URL}`);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ML_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") throw new Error("ML service request timed out");
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function predictRisk(req, res) {
  const { id } = req.params;

  const student = await Student.findOne({ _id: id, schoolId: req.user.schoolId });
  if (!student) {
    return res.status(404).json({ message: "Student not found in this school" });
  }

  // attendance_pct: present / (present + absent) — holidays are excluded entirely,
  // so the percentage is only ever computed against real school days
  const attendanceRecords = await Attendance.find({
    studentId: id,
    status: { $in: ["present", "absent"] }, // holiday records never counted
  });
  const presentDays = attendanceRecords.filter((r) => r.status === "present").length;
  const totalCountedDays = attendanceRecords.length;
  const attendancePct = totalCountedDays > 0 ? Math.round((presentDays / totalCountedDays) * 1000) / 10 : 0;

  // homework_completion_pct: same shape — submissions / assignments actually given
  const assignments = await Assignment.find({ classId: student.classId });
  const submissions = await Submission.find({
    studentId: id,
    assignmentId: { $in: assignments.map((a) => a._id) },
  });
  const homeworkCompletionPct = assignments.length > 0 ? Math.round((submissions.length / assignments.length) * 1000) / 10 : 0;

  // (female=1, male=0 / paid=1, unpaid=0) 
  const payload = {
    gender: student.gender === "female" ? 1 : 0,
    age: student.age,
    attendance_pct: attendancePct,
    marks: student.marks ?? 0,
    homework_completion_pct: homeworkCompletionPct,
    distance_to_school: Number.isFinite(student.distanceMeters) ? student.distanceMeters : 0,
    Tution_fee_status: student.tuitionFeeStatus === "paid" ? 1 : 0,
    Transportation_fee_status: student.transportationFeeStatus === "paid" ? 1 : 0,
    has_schlorship: student.hasScholarship ? 1 : 0,
    has_transportation: student.hasTransportation ? 1 : 0,
  };

  try {
    let response;

    try {
      response = await fetchWithTimeout(`${ML_SERVICE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if (err.message.includes("timed out")) {
        console.warn("ML service request timed out, retrying after delay");
        await sleep(ML_RETRY_DELAY_MS);
        response = await fetchWithTimeout(`${ML_SERVICE_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        throw err;
      }
    }

    if (response.status === 429) {
      console.warn("ML service rate-limited (429), retrying after delay");
      await sleep(ML_RETRY_DELAY_MS);
      response = await fetchWithTimeout(`${ML_SERVICE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      const body = await response.text();
      console.error(`ML service responded with status ${response.status}: ${body}`);
      return res.status(502).json({
        message:
          response.status === 429
            ? "ML service is temporarily busy. Please wait a few seconds and try again."
            : "ML service returned an error.",
        error: `ML service responded with ${response.status}`,
      });
    }

    const result = await response.json(); // { prediction, score, threshold, explanation }
    const riskScore = result.score;
    const riskLevel =
      riskScore < 0.4 ? "low" : riskScore < 0.6 ? "medium" : riskScore < 0.8 ? "high" : "critical";

    student.riskLevel = riskLevel;
    student.riskScore = riskScore;
    student.riskExplanation = result.explanation;
    await student.save();

    res.json({
      risk_level: riskLevel,
      risk_score: riskScore,
      explanation: result.explanation,
    });
  } catch (err) {
    console.error("Prediction endpoint error", err, "cause:", err.cause);
    res.status(502).json({
      message: "Failed to get prediction from ML service",
      error: err.message,
      cause: err.cause ? String(err.cause) : null,
    });
  }
}