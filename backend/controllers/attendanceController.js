import Attendance from "../models/attendance.js";

function getTodayString() {
  return new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'
}

export async function markAttendance(req, res) {
  const { records } = req.body; // [{ studentId, status }, ...]

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: "records array is required" });
  }

  const today = getTodayString();
  const results = [];

  for (const { studentId, classId, status } of records) {
    if (!studentId || !classId || !["present", "absent"].includes(status))
      continue;

    const record = await Attendance.findOneAndUpdate(
      { studentId, date: today },
      { studentId, classId, date: today, status, schoolId: req.user.schoolId },
      { upsert: true, new: true },
    );
    results.push(record);
  }

  res.json(results);
}

export async function getAttendance(req, res) {
  const { classId, date, studentId } = req.query;
  const targetDate = date || getTodayString();

  const filter = { schoolId: req.user.schoolId };

  if (classId) filter.classId = classId;
  if (studentId) filter.studentId = studentId;

  if (!studentId && !date) {
    filter.date = targetDate;
  } else if (date) {
    filter.date = date;
  }

  const records = await Attendance.find(filter).sort({ date: -1 });
  res.json(records);
}
