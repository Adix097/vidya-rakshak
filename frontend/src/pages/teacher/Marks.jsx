import { useState, useEffect } from "react";
import { api } from "../../api/client";

export default function Marks() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    api
      .get("/api/classes")
      .then((data) => {
        setClasses(data);
        if (data.length > 0) setSelectedClass(data[0]._id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    api
      .get(`/api/students?classId=${selectedClass}`)
      .then((data) => {
        setStudents(data);
        const initial = {};
        data.forEach((s) => {
          initial[s._id] = s.marks;
        });
        setMarks(initial);
      })
      .catch((err) => setError(err.message));
  }, [selectedClass]);

  const handleChange = (studentId, value) => {
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

  const handleSave = async () => {
    setError("");
    try {
      for (const s of students) {
        await api.patch(`/api/students/${s._id}/marks`, { marks: marks[s._id] });
        await sleep(300);
      }
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Marks</h1>
      <p className="text-sm text-gray-500 mb-6">
        Out of 100
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

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
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
        {students.map((student) => (
          <div
            key={student._id}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="text-sm text-gray-800">{student.name}</span>
            <input
              type="number"
              min="0"
              max="100"
              value={marks[student._id] ?? ""}
              onChange={(e) => handleChange(student._id, e.target.value)}
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
      {saved && <span className="ml-3 text-sm text-green-600">Saved</span>}
    </div>
  );
}
