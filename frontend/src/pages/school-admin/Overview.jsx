import { useState, useEffect } from "react";
import { api } from "../../api/client";

const RISK_ORDER = ["low", "medium", "high", "critical"];
const RISK_STYLES = {
  low: "bg-green-50 border-green-300 text-green-700",
  medium: "bg-yellow-50 border-yellow-300 text-yellow-700",
  high: "bg-orange-50 border-orange-300 text-orange-700",
  critical: "bg-red-50 border-red-300 text-red-700",
};

export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/students/overview")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Overview</h1>
      <p className="text-sm text-gray-500 mb-6">School-wide summary</p>

      <div className="bg-white border border-gray-200 rounded p-4 mb-6">
        <div className="text-sm text-gray-500">Total Students</div>
        <div className="text-2xl font-semibold text-gray-800">
          {data.totalStudents}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {RISK_ORDER.map((level) => (
          <div
            key={level}
            className={`border rounded p-3 text-center ${RISK_STYLES[level]}`}
          >
            <div className="text-xs capitalize">{level}</div>
            <div className="text-xl font-semibold">
              {data.riskCounts[level] ?? 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
