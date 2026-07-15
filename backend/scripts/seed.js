import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import School from "../models/school.js";
import Account from "../models/account.js";
import Class from "../models/class.js";

// chatgpt wrote the code below
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected for seeding");

  //! wipe existing data
  await School.deleteMany({});
  await Account.deleteMany({});
  await Class.deleteMany({});

  const school = await School.create({
    name: "Rajkiya Pratibha Vikas Vidyalaya",
    address: "Rohini, Delhi",
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await Account.create({
    name: "Priya Sharma",
    email: "admin@school.edu.in",
    passwordHash,
    role: "school-admin",
    schoolId: school._id,
  });

  const teacher = await Account.create({
    name: "Kavita Rao",
    email: "teacher@school.edu.in",
    passwordHash,
    role: "teacher",
    schoolId: school._id,
  });

  const feeCoordinator = await Account.create({
    name: "Ramesh Chandra",
    email: "fees@school.edu.in",
    passwordHash,
    role: "fee-coordinator",
    schoolId: school._id,
  });

  const class9b = await Class.create({
    name: "Class 9B",
    schoolId: school._id,
    teacherId: teacher._id,
  });

  console.log("Seeded:");
  console.log({
    school: school.name,
    admin: admin.email,
    teacher: teacher.email,
    feeCoordinator: feeCoordinator.email,
    class: class9b.name,
  });
  console.log("All accounts use password: password123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
