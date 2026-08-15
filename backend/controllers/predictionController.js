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
    if (err.name === "AbortError") {
      throw new Error("ML service request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function predictRisk(req, res) {
  const { id } = req.params;

  const student = await Student.findOne({
    _id: id,
    schoolId: req.user.schoolId,
  });
  if (!student) {
    return res
      .status(404)
      .json({ message: "Student not found in this school" });
  }

  // calculate the required features directly in this route
  // instead of fetching them from another endpoint
  const attendanceRecords = await Attendance.find({ studentId: id });
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(
    (r) => r.status === "present",
  ).length;
  const attendancePct =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 1000) / 10 : null;

  const assignments = await Assignment.find({ classId: student.classId });
  const submissions = await Submission.find({
    studentId: id,
    assignmentId: { $in: assignments.map((a) => a._id) },
  });
  const homeworkCompletion =
    assignments.length > 0
      ? Math.round((submissions.length / assignments.length) * 1000) / 10
      : null;

  const feeStatus = student.feeStatus === "paid" ? "no" : "yes";

  const hasMarks = student.marks !== null && student.marks !== undefined;
  const hasAttendance = attendanceRecords.length > 0 && attendancePct !== null;
  const hasHomeworkData = homeworkCompletion !== null;

  if (!hasMarks || !hasAttendance || !hasHomeworkData) {
    return res.status(400).json({
      message:
        "Not enough student history for prediction. Please record attendance, marks, and assignment activity before running the model.",
      details: {
        attendanceCount: attendanceRecords.length,
        marksRecorded: hasMarks,
        homeworkRecorded: hasHomeworkData,
      },
    });
  }

  const payload = {
    student_id: student._id.toString(),
    gender: student.gender,
    age: student.age,
    attendance_pct: attendancePct,
    marks: student.marks,
    homework_completion: homeworkCompletion,
    distance_to_school: student.distanceToSchool,
    fee_status: feeStatus,
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
        console.warn(
          "ML service request timed out on first attempt, retrying after delay",
          err,
        );
        await sleep(ML_RETRY_DELAY_MS);

        try {
          response = await fetchWithTimeout(`${ML_SERVICE_URL}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch (retryErr) {
          console.error("Prediction request failed after retry", retryErr);
          return res.status(504).json({
            message: "ML service is waking up. Please try again in a moment.",
            error: retryErr.message,
          });
        }
      } else {
        console.error("Prediction request failed", err);
        return res.status(502).json({
          message: "Failed to get prediction from ML service.",
          error: err.message,
          cause: err.cause ? String(err.cause) : null,
        });
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
      console.error(
        `ML service responded with status ${response.status}: ${body}`,
      );
      return res.status(502).json({
        message:
          response.status === 429
            ? "ML service is temporarily busy. Please wait a few seconds and try again."
            : "ML service returned an error.",
        error: `ML service responded with ${response.status}`,
      });
    }

    const prediction = await response.json();

    // save the result on the student
    student.riskLevel = prediction.risk_level;
    student.riskScore = prediction.risk_score;
    await student.save();

    res.json(prediction);
  } catch (err) {
    console.error("Prediction endpoint error", err, "cause:", err.cause);
    res.status(502).json({
      message: "Failed to get prediction from ML service",
      error: err.message,
      cause: err.cause ? String(err.cause) : null,
    });
  }
}
