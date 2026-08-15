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
  const { classId, date } = req.query;
  const targetDate = date || getTodayString();

  const filter = { schoolId: req.user.schoolId, date: targetDate };
  if (classId) filter.classId = classId;

  const records = await Attendance.find(filter);
  res.json(records);
}
