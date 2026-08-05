import Student from "../models/student.js";
import Attendance from "../models/attendance.js";
import Assignment from "../models/assignment.js";
import Submission from "../models/submission.js";

//! move to .env later on
const ML_SERVICE_URL = "http://localhost:8000";

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
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`ML service responded with ${response.status}`);
    }

    const prediction = await response.json();

    // save the result on the student
    student.riskLevel = prediction.risk_level;
    student.riskScore = prediction.risk_score;
    await student.save();

    res.json(prediction);
  } catch (err) {
    res.status(502).json({
      message: "Failed to get prediction from ML service",
      error: err.message,
    });
  }
}
