import "dotenv/config";
import mongoose from "mongoose";
import School from "../models/school.js";
import Class from "../models/class.js";
import Student from "../models/student.js";
import Attendance from "../models/Attendance.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";

async function seedDemoData() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected for demo seeding");

  const school = await School.findOne();
  if (!school) throw new Error("No school found — run npm run seed first");

  let cls = await Class.findOne({ schoolId: school._id });
  if (!cls) throw new Error("No class found — run npm run seed first");

  // wipe previous demo students/attendance/assignments so this is safely re-runnable
  const oldStudents = await Student.find({ schoolId: school._id });
  const oldStudentIds = oldStudents.map((s) => s._id);
  await Attendance.deleteMany({ studentId: { $in: oldStudentIds } });
  await Submission.deleteMany({ studentId: { $in: oldStudentIds } });
  await Assignment.deleteMany({ classId: cls._id });
  await Student.deleteMany({ schoolId: school._id });

  // deliberately varied — mix of clearly-low-risk, clearly-high-risk, and in-between
  const demoStudents = [
    {
      name: "Anjali Verma",
      gender: "female",
      age: 15,
      rollNumber: "9B-01",
      marks: 88,
      feeAmount: 5000,
      feeStatus: "paid",
      distanceToSchool: 1.2,
      attendanceRate: 0.95,
      homeworkRate: 1.0,
    },
    {
      name: "Rohit Singh",
      gender: "male",
      age: 15,
      rollNumber: "9B-02",
      marks: 32,
      feeAmount: 5000,
      feeStatus: "overdue",
      distanceToSchool: 14.5,
      attendanceRate: 0.45,
      homeworkRate: 0.2,
    },
    {
      name: "Fatima Khan",
      gender: "female",
      age: 14,
      rollNumber: "9B-03",
      marks: 91,
      feeAmount: 5000,
      feeStatus: "paid",
      distanceToSchool: 2.0,
      attendanceRate: 0.98,
      homeworkRate: 1.0,
    },
    {
      name: "Deepak Yadav",
      gender: "male",
      age: 16,
      rollNumber: "9B-04",
      marks: 55,
      feeAmount: 5500,
      feeStatus: "pending",
      distanceToSchool: 6.8,
      attendanceRate: 0.72,
      homeworkRate: 0.6,
    },
    {
      name: "Priya Nair",
      gender: "female",
      age: 16,
      rollNumber: "9B-05",
      marks: null,
      feeAmount: 5500,
      feeStatus: "overdue",
      distanceToSchool: 11.0,
      attendanceRate: 0.38,
      homeworkRate: 0.1,
    },
    {
      name: "Aditya Kumar",
      gender: "male",
      age: 15,
      rollNumber: "9B-06",
      marks: 68,
      feeAmount: 5000,
      feeStatus: "paid",
      distanceToSchool: 3.5,
      attendanceRate: 0.85,
      homeworkRate: 0.8,
    },
    {
      name: "Sneha Reddy",
      gender: "female",
      age: 14,
      rollNumber: "9B-07",
      marks: 45,
      feeAmount: 5000,
      feeStatus: "pending",
      distanceToSchool: 9.2,
      attendanceRate: 0.6,
      homeworkRate: 0.4,
    },
    {
      name: "Vikram Joshi",
      gender: "male",
      age: 16,
      rollNumber: "9B-08",
      marks: 22,
      feeAmount: 5500,
      feeStatus: "overdue",
      distanceToSchool: 18.0,
      attendanceRate: 0.3,
      homeworkRate: 0.15,
    },
    {
      name: "Meera Iyer",
      gender: "female",
      age: 15,
      rollNumber: "9B-09",
      marks: 79,
      feeAmount: 5000,
      feeStatus: "paid",
      distanceToSchool: 2.8,
      attendanceRate: 0.9,
      homeworkRate: 0.9,
    },
    {
      name: "Karan Malhotra",
      gender: "male",
      age: 15,
      rollNumber: "9B-10",
      marks: 60,
      feeAmount: 5000,
      feeStatus: "pending",
      distanceToSchool: 5.5,
      attendanceRate: 0.78,
      homeworkRate: 0.7,
    },
    {
      name: "Divya Patel",
      gender: "female",
      age: 16,
      rollNumber: "9B-11",
      marks: 38,
      feeAmount: 5500,
      feeStatus: "overdue",
      distanceToSchool: 13.2,
      attendanceRate: 0.5,
      homeworkRate: 0.25,
    },
    {
      name: "Arjun Mehta",
      gender: "male",
      age: 14,
      rollNumber: "9B-12",
      marks: 85,
      feeAmount: 5000,
      feeStatus: "paid",
      distanceToSchool: 1.8,
      attendanceRate: 0.93,
      homeworkRate: 0.95,
    },
  ];

  const students = [];
  for (const s of demoStudents) {
    const student = await Student.create({
      name: s.name,
      gender: s.gender,
      age: s.age,
      rollNumber: s.rollNumber,
      classId: cls._id,
      address: "Demo Address, Delhi",
      distanceToSchool: s.distanceToSchool,
      marks: s.marks,
      feeAmount: s.feeAmount,
      feeStatus: s.feeStatus,
      schoolId: school._id,
    });
    students.push({
      ...student.toObject(),
      attendanceRate: s.attendanceRate,
      homeworkRate: s.homeworkRate,
    });
  }

  // 20 days of attendance history per student, matching their target attendance rate
  const today = new Date();
  for (const s of students) {
    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const status = Math.random() < s.attendanceRate ? "present" : "absent";
      await Attendance.create({
        studentId: s._id,
        classId: cls._id,
        date: dateStr,
        status,
        schoolId: school._id,
      });
    }
  }

  // 5 assignments for the class, with submissions matching each student's homework rate
  const assignments = [];
  for (let i = 1; i <= 5; i++) {
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() - i * 4);
    const assignment = await Assignment.create({
      title: `Assignment ${i}`,
      classId: cls._id,
      dueDate: dueDate.toISOString().split("T")[0],
      schoolId: school._id,
    });
    assignments.push(assignment);
  }

  for (const s of students) {
    for (const a of assignments) {
      if (Math.random() < s.homeworkRate) {
        await Submission.create({
          assignmentId: a._id,
          studentId: s._id,
          submittedAt: new Date(),
        });
      }
    }
  }

  console.log(
    `Seeded ${students.length} demo students with attendance and assignment history`,
  );
  await mongoose.disconnect();
}

seedDemoData().catch((err) => {
  console.error("Demo seed failed:", err);
  process.exit(1);
});
