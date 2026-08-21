import { useState, useEffect } from "react";
import { api } from "../../api/client";

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [saved, setSaved] = useState(false);
  const [holidaySaved, setHolidaySaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    api.get("/api/classes")
      .then((data) => {
        setClasses(data);
        if (data.length > 0) setSelectedClass(data[0]._id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    api.get(`/api/students?classId=${selectedClass}`)
      .then((data) => {
        setStudents(data);
        const initial = {};
        data.forEach((s) => {
          initial[s._id] = Math.random() < 0.8 ? "present" : "absent";
        });
        setRecords(initial);
      })
      .catch((err) => setError(err.message));
  }, [selectedClass]);

  const setStatus = (studentId, status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
    setHolidaySaved(false);
  };

  const handleSave = async () => {
    setError("");
    const payload = {
      records: Object.entries(records).map(([studentId, status]) => ({
        studentId,
        classId: selectedClass,
        status,
      })),
    };
    try {
      await api.post("/api/attendance", payload);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkHoliday = async () => {
    setError("");
    try {
      await api.post("/api/attendance/holiday", {
        classId: selectedClass,
        studentIds: students.map((s) => s._id),
      });
      setHolidaySaved(true);
      setSaved(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-gray-800">Attendance</h1>
        <button
          onClick={handleMarkHoliday}
          className="text-xs px-3 py-1.5 border border-amber-300 rounded bg-amber-50 text-amber-700 hover:bg-amber-100"
        >
          Mark Today as Holiday
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">{today} — editable for today only</p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {holidaySaved && (
        <p className="text-sm text-amber-700 mb-4">
          Today marked as a holiday for this class — attendance won't count toward any student's percentage.
        </p>
      )}

      <div className="mb-6">
        <label className="text-sm text-gray-600 mr-2">Class</label>
        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSaved(false);
            setHolidaySaved(false);
          }}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
        >
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
        {students.map((student) => {
          const status = records[student._id] || null;
          return (
            <div key={student._id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-800">{student.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus(student._id, "present")}
                  className={`px-3 py-1 text-xs rounded border ${status === "present"
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  Present
                </button>
                <button
                  onClick={() => setStatus(student._id, "absent")}
                  className={`px-3 py-1 text-xs rounded border ${status === "absent"
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
      {saved && <span className="ml-3 text-sm text-green-600">Saved</span>}
    </div>
  );
}