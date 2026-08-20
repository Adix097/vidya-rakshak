import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, },
    date: { type: String, }, // stored as 'YYYY-MM-DD' required: true
    status: { type: String, enum: ["present", "absent"], required: true, },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true, },
    status: { type: String, enum: ["present", "absent", "holiday"], required: true, },
  },
  { timestamps: true },
);

// one attendance record per student per day — marking twice just updates never duplicates
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
