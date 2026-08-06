import Class from "../models/class.js";

export async function getClasses(req, res) {
  const classes = await Class.find({ schoolId: req.user.schoolId });
  res.json(classes);
}
