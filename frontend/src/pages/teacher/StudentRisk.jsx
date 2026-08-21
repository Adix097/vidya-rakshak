import { useState, useEffect } from "react";
import { api } from "../../api/client";
import RiskBadge from "../../Components/RiskBadge.jsx";

export default function StudentRisk() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
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
      .then(setStudents)
      .catch((err) => setError(err.message));
  }, [selectedClass]);

  const handlePredict = async (studentId) => {
    setError("");
    setPredicting((prev) => ({ ...prev, [studentId]: true }));
    try {
      const result = await api.post(`/api/students/${studentId}/predict`, {});
      setStudents((prev) =>
        prev.map((s) =>
          s._id === studentId
            ? { ...s, riskLevel: result.risk_level, riskScore: result.risk_score }
            : s
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setPredicting((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  const handlePredictAll = async () => {
    if (!students.length) return;

    setError("");
    for (const student of students) {
      setPredicting((prev) => ({ ...prev, [student._id]: true }));
      try {
        const result = await api.post(`/api/students/${student._id}/predict`, {});
        setStudents((prev) =>
          prev.map((s) =>
            s._id === student._id
              ? { ...s, riskLevel: result.risk_level, riskScore: result.risk_score }
              : s
          )
        );
      } catch (err) {
        setError(`Failed on ${student.name}: ${err.message}`);
      } finally {
        setPredicting((prev) => ({ ...prev, [student._id]: false }));
      }
    }

  };

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">
        Student Risk
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Predictions from the ML service
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

      <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
        {students.map((student) => (
          <div
            key={student._id}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="text-sm text-gray-800">{student.name}</span>
            <div className="flex items-center gap-3">
              {student.riskLevel ? (
                <RiskBadge level={student.riskLevel} />
              ) : (
                <span className="text-xs text-gray-400">Not yet predicted</span>
              )}
              <button
                onClick={() => handlePredict(student._id)}
                disabled={predicting[student._id]}
                className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                {predicting[student._id] ? "Predicting..." : "Predict"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
