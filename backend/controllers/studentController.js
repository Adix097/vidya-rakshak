import Student from "../models/student.js";
import Class from "../models/class.js";
import School from "../models/school.js";
import { geocodeAddress, calculateDistanceMeters } from "../utils/distance.js";

export async function createStudent(req, res) {
  const {
    name,
    gender,
    age,
    rollNumber,
    classId,
    address,
    tuitionFeeAmount,
    tuitionFeeStatus,
    transportationFeeAmount,
    transportationFeeStatus,
    hasScholarship,
    hasTransportation,
    parentPhone,
  } = req.body;

  if (
    !name ||
    !gender ||
    !rollNumber ||
    !classId ||
    !address ||
    age == null ||
    tuitionFeeAmount == null ||
    !parentPhone
  ) {
    return res.status(400).json({
      message:
        "name, gender, rollNumber, classId, age, address, tuitionFeeAmount, and parentPhone are required",
    });
  }

  if (!["male", "female"].includes(gender)) {
    return res.status(400).json({ message: "gender must be male or female" });
  }

  if (typeof age !== "number" || age < 3) {
    return res.status(400).json({ message: "age must be a number, at least 3" });
  }

  const classDoc = await Class.findOne({ _id: classId, schoolId: req.user.schoolId });
  if (!classDoc) {
    return res.status(404).json({ message: "Class not found" });
  }

  try {
    let distanceMeters = 0;
    const coords = await geocodeAddress(address);
    if (coords) {
      const school = await School.findById(req.user.schoolId);
      if (school) {
        distanceMeters = calculateDistanceMeters(school.lat, school.lng, coords.lat, coords.lng);
      }
    }

    const student = await Student.create({
      name,
      gender,
      age,
      rollNumber,
      classId,
      address,
      distanceMeters,
      tuitionFeeAmount,
      tuitionFeeStatus: tuitionFeeStatus || "unpaid",
      transportationFeeAmount: transportationFeeAmount || 0,
      transportationFeeStatus: transportationFeeStatus || "unpaid",
      hasScholarship: !!hasScholarship,
      hasTransportation: !!hasTransportation,
      parentPhone,
      schoolId: req.user.schoolId,
    });

    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "A student with this roll number already exists in this school",
      });
    }
    res.status(500).json({ message: "Failed to create student", error: err.message });
  }
}

export async function getStudents(req, res) {
  const { classId } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (classId) filter.classId = classId;

  const students = await Student.find(filter).populate("classId", "name");
  res.json(students);
}

export async function updateStudent(req, res) {
  const allowed = ["name", "classId", "parentPhone", "age", "gender"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (updates.gender && !["male", "female"].includes(updates.gender)) {
    return res.status(400).json({ message: "gender must be male or female" });
  }

  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, schoolId: req.user.schoolId },
    updates,
    { new: true }
  );

  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
}

export async function updateMarks(req, res) {
  const { id } = req.params;
  const { marks } = req.body;

  if (typeof marks !== "number" || marks < 0 || marks > 100) {
    return res.status(400).json({ message: "marks must be a number between 0 and 100" });
  }

  const student = await Student.findOneAndUpdate(
    { _id: id, schoolId: req.user.schoolId },
    { marks },
    { new: true }
  );

  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
}

export async function updateTuitionFeeStatus(req, res) {
  const { tuitionFeeStatus } = req.body;
  if (!["paid", "unpaid"].includes(tuitionFeeStatus)) {
    return res.status(400).json({ message: "must be paid or unpaid" });
  }

  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, schoolId: req.user.schoolId },
    { tuitionFeeStatus },
    { new: true }
  );

  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
}

export async function updateTransportationFeeStatus(req, res) {
  const { transportationFeeStatus } = req.body;
  if (!["paid", "unpaid"].includes(transportationFeeStatus)) {
    return res.status(400).json({ message: "must be paid or unpaid" });
  }

  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, schoolId: req.user.schoolId },
    { transportationFeeStatus },
    { new: true }
  );

  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
}

export async function getRiskOverview(req, res) {
  const students = await Student.find({ schoolId: req.user.schoolId });
  const totalStudents = students.length;
  const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 };

  students.forEach((s) => {
    if (s.riskLevel && riskCounts[s.riskLevel] !== undefined) {
      riskCounts[s.riskLevel]++;
    }
  });

  res.json({ totalStudents, riskCounts });
}