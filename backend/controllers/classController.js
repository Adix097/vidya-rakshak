import Class from "../models/class.js";

export async function getClasses(req, res) {
  const classes = await Class.find({ schoolId: req.user.schoolId });
  res.json(classes);
}

export async function createClass(req, res) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  try {
    const cls = await Class.create({ name, schoolId: req.user.schoolId });
    res.status(201).json(cls);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A class with this name already exists" });
    }
    res.status(500).json({ message: "Failed to create class", error: err.message });
  }
}