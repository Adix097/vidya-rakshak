import Assignment from "../models/assignment.js";
import Submission from "../models/submission.js";

export async function createAssignment(req, res) {
  const { title, classId, dueDate } = req.body;

  if (!title || !classId || !dueDate) {
    return res
      .status(400)
      .json({ message: "title, classId, and dueDate are required" });
  }

  const assignment = await Assignment.create({
    title,
    classId,
    dueDate,
    schoolId: req.user.schoolId,
  });

  res.status(201).json(assignment);
}

export async function getAssignments(req, res) {
  const { classId } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (classId) filter.classId = classId;

  const assignments = await Assignment.find(filter).sort({ dueDate: -1 });
  res.json(assignments);
}

export async function markSubmitted(req, res) {
  const { assignmentId, studentId } = req.body;

  if (!assignmentId || !studentId) {
    return res
      .status(400)
      .json({ message: "assignmentId and studentId are required" });
  }

  // confirm the assignment actually belongs to this teacher's school
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    schoolId: req.user.schoolId,
  });
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  try {
    const submission = await Submission.create({ assignmentId, studentId });
    res.status(201).json(submission);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Already marked as submitted" });
    }
    res
      .status(500)
      .json({ message: "Failed to mark submission", error: err.message });
  }
}
