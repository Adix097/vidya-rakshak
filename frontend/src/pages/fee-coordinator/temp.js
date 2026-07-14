// TEMPORARY: stand-in for data that will come from Express/Postgres later.
export const CLASSES = [
  { id: "class-9b", name: "Class 9B" },
  { id: "class-10a", name: "Class 10A" },
];

export const STUDENTS = [
  {
    id: 1,
    name: "Anjali Verma",
    classId: "class-9b",
    feeAmount: 5000,
    status: "paid",
  },
  {
    id: 2,
    name: "Rohit Singh",
    classId: "class-9b",
    feeAmount: 5000,
    status: "overdue",
  },
  {
    id: 3,
    name: "Fatima Khan",
    classId: "class-9b",
    feeAmount: 5000,
    status: "paid",
  },
  {
    id: 4,
    name: "Deepak Yadav",
    classId: "class-10a",
    feeAmount: 5500,
    status: "pending",
  },
  {
    id: 5,
    name: "Priya Nair",
    classId: "class-10a",
    feeAmount: 5500,
    status: "overdue",
  },
];
