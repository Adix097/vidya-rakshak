import Account from "../models/account.js";
import bcrypt from "bcryptjs";

export async function createAccount(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: "name, email, password, and role are required" });
  }
  if (!["teacher", "fee-coordinator"].includes(role)) {
    return res
      .status(400)
      .json({ message: "role must be teacher or fee-coordinator" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const account = await Account.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      schoolId: req.user.schoolId,
    });
    res.status(201).json({
      id: account._id,
      name: account.name,
      email: account.email,
      role: account.role,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }
    res
      .status(500)
      .json({ message: "Failed to create account", error: err.message });
  }
}

export async function getAccounts(req, res) {
  const accounts = await Account.find({
    schoolId: req.user.schoolId,
    role: { $in: ["teacher", "fee-coordinator"] },
  }).select("-passwordHash");
  res.json(accounts);
}
