import { useEffect, useState } from "react";
import { api } from "../../api/client";

function TrendChart({ title, points, max, suffix = "" }) {
  const width = 560;
  const height = 180;
  const padding = 24;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const values = points.map((point) => point.value);
  const coordinates = points.map((point, index) => {
    const x = padding + (points.length === 1 ? usableWidth / 2 : (index / (points.length - 1)) * usableWidth);
    const y = height - padding - (point.value / max) * usableHeight;
    return { ...point, x, y };
  });

  return (
    <section className="bg-white border border-gray-200 rounded p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        <span className="text-xs text-gray-400">{values.length} records</span>
      </div>
      {points.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">No history yet.</p>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44" role="img" aria-label={`${title} trend`}>
          {[0, 0.5, 1].map((fraction) => {
            const y = height - padding - fraction * usableHeight;
            return <line key={fraction} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e5e7eb" />;
          })}
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            points={coordinates.map((point) => `${point.x},${point.y}`).join(" ")}
          />
          {coordinates.map((point) => (
            <g key={`${point.date}-${point.x}`}>
              <circle cx={point.x} cy={point.y} r="4" fill="#2563eb" />
              <title>{`${new Date(point.date).toLocaleDateString()} ${point.value}${suffix}`}</title>
            </g>
          ))}
          <text x={padding} y={height - 4} fontSize="10" fill="#9ca3af">
            {new Date(points[0].date).toLocaleDateString()}
          </text>
          <text x={width - padding} y={height - 4} textAnchor="end" fontSize="10" fill="#9ca3af">
            {new Date(points[points.length - 1].date).toLocaleDateString()}
          </text>
        </svg>
      )}
    </section>
  );
}

export default function StudentSummary() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/classes").then((data) => {
      setClasses(data);
      setSelectedClass(data[0]?._id || "");
    }).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    api.get(`/api/students?classId=${selectedClass}`).then((data) => {
      setStudents(data);
      setSelectedStudent(data[0]?._id || "");
    }).catch((err) => setError(err.message));
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedStudent) return;
    api.get(`/api/students/${selectedStudent}/summary`)
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, [selectedStudent]);

  const riskPoints = summary?.risk.map((point) => ({ ...point, value: point.score })) || [];
  const latestRisk = summary?.risk.at(-1);
  const explanations = latestRisk?.explanation || summary?.student.riskExplanation || [];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Student Summary</h1>
      <p className="text-sm text-gray-500 mb-6">Attendance, marks, and risk history</p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
          {classes.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
        </select>
        <select value={selectedStudent} onChange={(event) => setSelectedStudent(event.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
          {students.map((student) => <option key={student._id} value={student._id}>{student.name}</option>)}
        </select>
      </div>

      {summary && (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <TrendChart title="Attendance" points={summary.attendance.map((point) => ({ ...point, value: point.percentage }))} max={100} suffix="%" />
            <TrendChart title="Marks" points={summary.marks} max={100} />
            <TrendChart title="Risk score" points={riskPoints} max={1} />
          </div>

          <section className="bg-white border border-gray-200 rounded p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Latest risk analysis</h2>
            {explanations.length ? (
              <div className="divide-y divide-gray-100">
                {explanations.map((item, index) => (
                  <div key={`${item.feature}-${index}`} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-700">{item.feature}</span>
                    <span className={item.impact >= 0 ? "text-red-600" : "text-green-600"}>{item.impact}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">Run a prediction to see the factors behind the score.</p>}
          </section>
        </>
      )}
    </div>
  );
}
