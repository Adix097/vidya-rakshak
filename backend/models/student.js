import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    travelMinutes: {
      type: Number,
      default: null, // not required at creation
    },
    marks: {
      type: Number,
      default: null, // null = ungraded/missed/cancelled not zero
      min: 0,
      max: 100,
    },
    feeAmount: {
      type: Number,
      required: true,
    },
    feeStatus: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      required: true,
      default: "pending",
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
  },
  { timestamps: true },
);

studentSchema.index({ rollNumber: 1, schoolId: 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);

export default Student;
