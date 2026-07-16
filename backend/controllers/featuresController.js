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

  // --- attendance_pct: % of marked days present, across all recorded days ---
  const attendanceRecords = await Attendance.find({ studentId: id });
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(
    (r) => r.status === "present",
  ).length;
  const attendancePct =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 1000) / 10 : null;

  // --- avg_assignment_delay_days: average(submittedAt - dueDate) across this student's class assignments ---
  const assignments = await Assignment.find({ classId: student.classId });
  const submissions = await Submission.find({
    studentId: id,
    assignmentId: { $in: assignments.map((a) => a._id) },
  });

  let avgDelayDays = null;
  if (submissions.length > 0) {
    const delays = submissions.map((sub) => {
      const assignment = assignments.find((a) =>
        a._id.equals(sub.assignmentId),
      );
      const dueDate = new Date(assignment.dueDate);
      const submittedAt = new Date(sub.submittedAt);
      const diffMs = submittedAt - dueDate;
      return diffMs / (1000 * 60 * 60 * 24); // ms -> days, can be negative if submitted early
    });
    avgDelayDays =
      Math.round((delays.reduce((sum, d) => sum + d, 0) / delays.length) * 10) /
      10;
  }

  // --- fee_due: paid -> no, pending/overdue -> yes (locked earlier) ---
  const feeDue = student.feeStatus === "paid" ? "no" : "yes";

  res.json({
    student_id: student._id,
    gender: student.gender,
    attendance_pct: attendancePct,
    avg_assignment_delay_days: avgDelayDays,
    travel_minutes: student.travelMinutes,
    marks: student.marks,
    fee_due: feeDue,
  });
}
