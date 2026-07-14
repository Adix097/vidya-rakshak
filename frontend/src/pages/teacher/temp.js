// TEMPORARY: stand-in for data that will come from Express/Postgres later.
export const CLASSES = [
  { id: "class-9b", name: "Class 9B" },
  { id: "class-10a", name: "Class 10A" },
];

export const STUDENTS = [
  { id: 1, name: "Anjali Verma", classId: "class-9b", marks: 78, risk: "low" },
  { id: 2, name: "Rohit Singh", classId: "class-9b", marks: 45, risk: "high" },
  { id: 3, name: "Fatima Khan", classId: "class-9b", marks: 92, risk: "low" },
  {
    id: 4,
    name: "Deepak Yadav",
    classId: "class-10a",
    marks: 60,
    risk: "medium",
  },
  {
    id: 5,
    name: "Priya Nair",
    classId: "class-10a",
    marks: null,
    risk: "critical",
  },
];
