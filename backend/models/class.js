import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // "Class 9B"
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      default: null,
    },
  },
  { timestamps: true },
);

// class names should be unique within a school two "9B" in one school makes no sense
classSchema.index({ name: 1, schoolId: 1 }, { unique: true });

const Class = mongoose.model("Class", classSchema);

export default Class;
