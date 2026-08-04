import Student from "../models/student.js";
import Attendance from "../models/attendance.js";
import Assignment from "../models/assignment.js";
import Submission from "../models/submission.js";

export async function getStudentFeatures(req, res) {
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

  // --- attendance_pct: % of marked days present ---
  const attendanceRecords = await Attendance.find({ studentId: id });
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(
    (r) => r.status === "present",
  ).length;
  
  const attendancePct =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 1000) / 10 : null;

  // --- homework_completion: % of class assignments this student actually submitted ---
  const assignments = await Assignment.find({ classId: student.classId });
  const submissions = await Submission.find({
    studentId: id,
    assignmentId: { $in: assignments.map((a) => a._id) },
  });
  const homeworkCompletion =
    assignments.length > 0
      ? Math.round((submissions.length / assignments.length) * 1000) / 10
      : null;

  // --- fee_status: paid -> no, pending/overdue -> yes ---
  const feeStatus = student.feeStatus === "paid" ? "no" : "yes";

  res.json({
    student_id: student._id,
    gender: student.gender,
    age: student.age,
    attendance_pct: attendancePct,
    marks: student.marks,
    homework_completion: homeworkCompletion,
    distance_to_school: student.distanceToSchool,
    fee_status: feeStatus,
  });
}
