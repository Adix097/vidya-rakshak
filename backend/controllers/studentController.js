import Student from "../models/student.js";
import Class from "../models/class.js";

export async function createStudent(req, res) {
  const { name, rollNumber, classId, address, feeAmount, feeStatus } = req.body;

  if (!name || !rollNumber || !classId || !address || feeAmount == null) {
    return res.status(400).json({
      message: "name, rollNumber, classId, address, and feeAmount are required",
    });
  }

  // confirm the class actually exists and belongs to this coordinator's school
  const classDoc = await Class.findOne({
    _id: classId,
    schoolId: req.user.schoolId,
  });
  if (!classDoc) {
    return res.status(404).json({ message: "Class not found" });
  }

  try {
    const student = await Student.create({
      name,
      rollNumber,
      classId,
      address,
      feeAmount,
      feeStatus: feeStatus || "pending",
      schoolId: req.user.schoolId,
    });

    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message:
          "A student with this roll number already exists in this school",
      });
    }
    res
      .status(500)
      .json({ message: "Failed to create student", error: err.message });
  }
}

export async function getStudents(req, res) {
  const { classId } = req.query;

  const filter = { schoolId: req.user.schoolId };
  if (classId) {
    filter.classId = classId;
  }

  const students = await Student.find(filter).populate("classId", "name");
  res.json(students);
}

export async function updateMarks(req, res) {
  const { id } = req.params;
  const { marks } = req.body;

  if (
    marks !== null &&
    (typeof marks !== "number" || marks < 0 || marks > 100)
  ) {
    return res.status(400).json({ message: "out of range" });
  }

  const student = await Student.findOneAndUpdate(
    { _id: id, schoolId: req.user.schoolId },
    { marks },
    { new: true },
  );

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
}

export async function updateFeeStatus(req, res) {
  const { id } = req.params;
  const { feeStatus } = req.body;

  if (!["paid", "pending", "overdue"].includes(feeStatus)) {
    return res
      .status(400)
      .json({ message: "Must be paid, pending, or overdue" });
  }

  const student = await Student.findOneAndUpdate(
    { _id: id, schoolId: req.user.schoolId },
    { feeStatus },
    { new: true },
  );

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
}
