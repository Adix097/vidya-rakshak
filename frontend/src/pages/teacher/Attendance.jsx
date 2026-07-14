import { useState } from "react";
import { CLASSES, STUDENTS } from "./mockData";

const Attendance = () => {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0].id);
  const [records, setRecords] = useState({}); // { studentId: 'present' | 'absent' }
  const [saved, setSaved] = useState(false);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const studentsInClass = STUDENTS.filter((s) => s.classId === selectedClass);

  const setStatus = (studentId, status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: replace with real API call once Express backend exists
    console.log("Saving attendance for", selectedClass, records);
    setSaved(true);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Attendance</h1>
      <p className="text-sm text-gray-500 mb-6">
        {today} — editable for today only
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
        {studentsInClass.map((student) => {
          const status = records[student.id] || null;
          return (
            <div
              key={student.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm text-gray-800">{student.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus(student.id, "present")}
                  className={`px-3 py-1 text-xs rounded border ${
                    status === "present"
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Present
                </button>
                <button
                  onClick={() => setStatus(student.id, "absent")}
                  className={`px-3 py-1 text-xs rounded border ${
                    status === "absent"
                      ? "bg-red-50 border-red-300 text-red-700"
                      : "border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Absent
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        className="mt-6 px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700"
      >
        Save Attendance
      </button>
      {saved && (
        <span className="ml-3 text-sm text-green-600">
          Saved (local only, no backend yet)
        </span>
      )}
    </div>
  );
};

export default Attendance;
