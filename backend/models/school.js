import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", //! danger here
    },
  },
  { timestamps: true },
);

const School = mongoose.model("School", schoolSchema);

export default School;
