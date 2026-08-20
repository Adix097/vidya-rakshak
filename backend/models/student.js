import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    age: { type: Number, required: true, min: 3 },
    rollNumber: { type: String, required: true, trim: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    address: { type: String, required: true, trim: true },
    distanceMeters: { type: Number, required: true, min: 0 },
    marks: { type: Number, default: 0, min: 0, max: 100 },
    tuitionFeeAmount: { type: Number, required: true },
    tuitionFeeStatus: { type: String, enum: ["paid", "unpaid"], required: true, default: "unpaid" },
    transportationFeeAmount: { type: Number, default: 0 },
    transportationFeeStatus: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
    hasScholarship: { type: Boolean, default: false },
    hasTransportation: { type: Boolean, default: false },
    parentPhone: { type: String, required: true, trim: true },
    riskLevel: { type: String, enum: ["low", "medium", "high", "critical"], default: null },
    riskScore: { type: Number, default: null },
    riskExplanation: { type: mongoose.Schema.Types.Mixed, default: null },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  },
  { timestamps: true }
);

studentSchema.index({ rollNumber: 1, schoolId: 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);
export default Student;