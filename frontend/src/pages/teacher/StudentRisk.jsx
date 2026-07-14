import { useState } from "react";
import { CLASSES, STUDENTS } from "./temp";
import RiskBadge from "../../components/RiskBadge";

const StudentRisk = () => {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0].id);

  const studentsInClass = STUDENTS.filter((s) => s.classId === selectedClass);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">
        Student Risk
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Static placeholder scores — real predictions come from the ML service
        later
      </p>

      <div className="mb-6">
        <label className="text-sm text-gray-600 mr-2">Class</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
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
            <RiskBadge level={student.risk} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentRisk;
