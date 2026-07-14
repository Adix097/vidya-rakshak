import { useState } from "react";
import { CLASSES, STUDENTS } from "./temp";

const Marks = () => {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0].id);
  const [marks, setMarks] = useState(() => {
    const initial = {};
    STUDENTS.forEach((s) => {
      initial[s.id] = s.marks;
    });
    return initial;
  });
  const [saved, setSaved] = useState(false);

  const studentsInClass = STUDENTS.filter((s) => s.classId === selectedClass);

  const handleChange = (studentId, value) => {
    // allow empty string (clearing the field) or a valid 0-100 number
    if (value === "") {
      setMarks((prev) => ({ ...prev, [studentId]: null }));
      setSaved(false);
      return;
    }
    const num = Number(value);
    if (Number.isNaN(num) || num < 0 || num > 100) return;
    setMarks((prev) => ({ ...prev, [studentId]: num }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: replace with real API call once Express backend exists
    console.log("Saving marks for", selectedClass, marks);
    setSaved(true);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Marks</h1>
      <p className="text-sm text-gray-500 mb-6">
        Out of 100 — can be updated anytime
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
            <span className="text-sm text-gray-800">{student.name}</span>
            <input
              type="number"
              min="0"
              max="100"
              value={marks[student.id] ?? ""}
              onChange={(e) => handleChange(student.id, e.target.value)}
              placeholder="—"
              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-6 px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700"
      >
        Save Marks
      </button>
      {saved && (
        <span className="ml-3 text-sm text-green-600">
          Saved (local only, no backend yet)
        </span>
      )}
    </div>
  );
};

export default Marks;
