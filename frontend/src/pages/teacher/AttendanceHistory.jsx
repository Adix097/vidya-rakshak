import { useState, useEffect } from "react";
import { api } from "../../api/client";

export default function AttendanceHistory() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [students, setStudents] = useState([]);
    const [records, setRecords] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/api/classes")
            .then((data) => {
                setClasses(data);
                if (data.length > 0) setSelectedClass(data[0]._id);
            })
            .catch((err) => setError(err.message));
    }, []);

    useEffect(() => {
        if (!selectedClass) return;
        api.get(`/api/students?classId=${selectedClass}`).then(setStudents).catch((err) => setError(err.message));
        api.get(`/api/attendance/history?classId=${selectedClass}&days=14`).then(setRecords).catch((err) => setError(err.message));
    }, [selectedClass]);

    // build the last 14 dates so every column shows even if no record exists for that day
    const dates = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split("T")[0]);
    }

    const getStatus = (studentId, date) => {
        const rec = records.find((r) => r.studentId === studentId && r.date === date);
        return rec ? rec.status : null;
    };

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">Attendance History</h1>
            <p className="text-sm text-gray-500 mb-6">Last 14 days</p>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <div className="mb-6">
                <label className="text-sm text-gray-600 mr-2">Class</label>
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
                    {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
            </div>

            <div className="bg-white border border-gray-200 rounded overflow-x-auto">
                <table className="text-xs w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left px-3 py-2 text-gray-600">Student</th>
                            {dates.map((d) => (
                                <th key={d} className="px-1 py-2 text-gray-400 font-normal">{d.slice(5)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s._id} className="border-b border-gray-50">
                                <td className="px-3 py-2 text-gray-800 whitespace-nowrap">{s.name}</td>
                                {dates.map((d) => {
                                    const status = getStatus(s._id, d);
                                    return (
                                        <td key={d} className="text-center px-1">
                                            <span className={`inline-block w-4 h-4 rounded-sm ${status === "present" ? "bg-green-400" :
                                                    status === "absent" ? "bg-red-400" : "bg-gray-100"
                                                }`} title={status || "no record"} />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}