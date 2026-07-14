import { useState } from "react";
import { CLASSES, STUDENTS } from "./mockData";

const STATUS_STYLES = {
  paid: "bg-green-50 border-green-300 text-green-700",
  pending: "bg-yellow-50 border-yellow-300 text-yellow-700",
  overdue: "bg-red-50 border-red-300 text-red-700",
};

const STATUS_LABELS = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
};

export default function FeeStatus() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0].id);
  const [students, setStudents] = useState(STUDENTS);
  const [saved, setSaved] = useState(false);

  const studentsInClass = students.filter((s) => s.classId === selectedClass);

  const handleStatusChange = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s)),
    );
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: replace with real API call once Express backend exists
    console.log("Saving fee status for", selectedClass, studentsInClass);
    setSaved(true);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Fee Status</h1>
      <p className="text-sm text-gray-500 mb-6">
        Update payment status per student
      </p>

      <div className="mb-6">
        <label className="text-sm text-gray-600 mr-2">Class</label>
        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSaved(false);
          }}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
        >
          {CLASSES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
        {studentsInClass.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <div className="text-sm text-gray-800">{student.name}</div>
              <div className="text-xs text-gray-500">₹{student.feeAmount}</div>
            </div>
            <select
              value={student.status}
              onChange={(e) => handleStatusChange(student.id, e.target.value)}
              className={`text-xs rounded border px-2 py-1 ${STATUS_STYLES[student.status]}`}
            >
              <option value="paid">{STATUS_LABELS.paid}</option>
              <option value="pending">{STATUS_LABELS.pending}</option>
              <option value="overdue">{STATUS_LABELS.overdue}</option>
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-6 px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700"
      >
        Save Fee Status
      </button>
      {saved && (
        <span className="ml-3 text-sm text-green-600">
          Saved (local only, no backend yet)
        </span>
      )}
    </div>
  );
}
