import jwt from "jsonwebtoken";
import Account from "../models/account.js";

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const account = await Account.findOne({ email: email.toLowerCase() });
  if (!account) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await account.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { accountId: account._id, role: account.role, schoolId: account.schoolId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.json({
    token,
    user: {
      id: account._id,
      name: account.name,
      email: account.email,
      role: account.role,
      schoolId: account.schoolId,
    },
  });
}
