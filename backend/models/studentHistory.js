import mongoose from "mongoose";

const studentHistorySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    type: { type: String, enum: ["marks", "risk"], required: true },
    value: { type: Number, required: true },
    riskLevel: { type: String, enum: ["low", "medium", "high", "critical"], default: null },
    explanation: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

studentHistorySchema.index({ studentId: 1, type: 1, createdAt: 1 });

const StudentHistory = mongoose.model("StudentHistory", studentHistorySchema);
export default StudentHistory;
