import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["school-admin", "teacher", "fee-coordinator"],
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
  },
  { timestamps: true },
);

// check a plaintext password against the stored hash
accountSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

const Account = mongoose.model("Account", accountSchema);

export default Account;
