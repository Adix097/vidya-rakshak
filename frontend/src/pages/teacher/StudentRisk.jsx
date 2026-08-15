import { useState, useEffect } from "react";
import { api } from "../../api/client";
import RiskBadge from "../../Components/RiskBadge.jsx";

export default function StudentRisk() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [attendanceByStudent, setAttendanceByStudent] = useState({});
  const [predicting, setPredicting] = useState({}); // studentId
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
        setSelectedStudentId((prev) => {
          if (data.some((student) => student._id === prev)) return prev;
          return data[0]?._id || "";
        });
      })
      .catch((err) => setError(err.message));

    api
      .get(`/api/attendance?classId=${selectedClass}`)
      .then((records) => {
        const grouped = {};
        records.forEach((record) => {
          if (!grouped[record.studentId]) grouped[record.studentId] = [];
          grouped[record.studentId].push(record);
        });
        Object.keys(grouped).forEach((studentId) => {
          grouped[studentId].sort((a, b) => b.date.localeCompare(a.date));
        });
        setAttendanceByStudent(grouped);
      })
      .catch((err) => setError(err.message));
  }, [selectedClass]);

  const canPredictStudent = (student) => {
    const history = attendanceByStudent[student._id] || [];
    const hasAttendance = history.length > 0;
    const hasMarks = student.marks !== null && student.marks !== undefined;
    return hasAttendance && hasMarks;
  };

  const selectedStudent = students.find((student) => student._id === selectedStudentId) || null;
  const selectedHistory = selectedStudent
    ? (attendanceByStudent[selectedStudent._id] || []).slice().sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const handlePredict = async (studentId) => {
    const student = students.find((item) => item._id === studentId);
    if (!student) return;

    if (!canPredictStudent(student)) {
      setError(
        `${student.name} needs at least one attendance record and a marks entry before prediction.`,
      );
      return;
    }

    setError("");
    setPredicting((prev) => ({ ...prev, [studentId]: true }));
    try {
      const result = await api.post(`/api/students/${studentId}/predict`, {});
      setStudents((prev) =>
        prev.map((s) =>
          s._id === studentId
            ? {
                ...s,
                riskLevel: result.risk_level,
                riskScore: result.risk_score,
              }
            : s,
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setPredicting((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  const handlePredictAll = async () => {
    const eligibleStudents = students.filter((student) => canPredictStudent(student));
    if (!eligibleStudents.length) {
      setError("No students are ready for prediction yet. Add attendance and marks first.");
      return;
    }

    setError("");
    const allStudentIds = eligibleStudents.map((student) => student._id);

    for (const studentId of allStudentIds) {
      if (!predicting[studentId]) {
        setPredicting((prev) => ({ ...prev, [studentId]: true }));
      }
    }

    try {
      await Promise.all(
        allStudentIds.map(async (studentId) => {
          const result = await api.post(`/api/students/${studentId}/predict`, {});
          setStudents((prev) =>
            prev.map((s) =>
              s._id === studentId
                ? {
                    ...s,
                    riskLevel: result.risk_level,
                    riskScore: result.risk_score,
                  }
                : s,
            ),
          );
        }),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setPredicting({});
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">
        Student Risk
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Predictions from the ML service using attendance, marks, and homework history
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <label className="text-sm text-gray-600 mr-2">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
          >
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handlePredictAll}
          disabled={!students.length || Object.values(predicting).some(Boolean)}
          className="text-xs px-3 py-2 border border-blue-300 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Predict All
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
          {students.map((student) => {
            const studentReady = canPredictStudent(student);
            return (
              <div
                key={student._id}
                className={`flex items-center justify-between px-4 py-3 ${selectedStudentId === student._id ? "bg-blue-50" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedStudentId(student._id)}
                  className="text-left text-sm text-gray-800 hover:text-blue-700"
                >
                  {student.name}
                </button>
                <div className="flex items-center gap-3">
                  {student.riskLevel ? (
                    <RiskBadge level={student.riskLevel} />
                  ) : (
                    <span className="text-xs text-gray-400">Not yet predicted</span>
                  )}
                  <button
                    onClick={() => handlePredict(student._id)}
                    disabled={predicting[student._id] || !studentReady}
                    className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      studentReady
                        ? "Predict risk"
                        : "Need attendance and marks before prediction"
                    }
                  >
                    {predicting[student._id] ? "Predicting..." : "Predict"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {selectedStudent && (
          <div className="bg-white border border-gray-200 rounded p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{selectedStudent.name}</h2>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Current marks</span>
                <span className="font-medium">{selectedStudent.marks ?? "Not entered"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Attendance history</span>
                <span className="font-medium">{selectedHistory.length} records</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Prediction ready</span>
                <span className={`font-medium ${canPredictStudent(selectedStudent) ? "text-green-600" : "text-amber-600"}`}>
                  {canPredictStudent(selectedStudent) ? "Yes" : "No"}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                Recent attendance
              </p>
              {selectedHistory.length > 0 ? (
                <ul className="space-y-2 text-xs text-gray-700">
                  {selectedHistory.slice(0, 7).map((record) => (
                    <li key={`${record.studentId}-${record.date}`} className="flex items-center justify-between border-b border-gray-100 pb-1 last:border-b-0">
                      <span>{record.date}</span>
                      <span className={record.status === "present" ? "text-green-600" : "text-red-600"}>
                        {record.status === "present" ? "Present" : "Absent"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">No attendance history yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
