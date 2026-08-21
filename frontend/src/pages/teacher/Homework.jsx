import { useState, useEffect } from "react";
import { api } from "../../api/client";

export default function Homework() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [selectedAssignment, setSelectedAssignment] = useState("");
    const [submittedIds, setSubmittedIds] = useState(new Set());

    useEffect(() => {
        api.get("/api/classes")
            .then((data) => {
                setClasses(data);
                if (data.length > 0) setSelectedClass(data[0]._id);
            })
            .catch((err) => setError(err.message));
    }, []);

    const loadAssignments = (classId) => {
        if (!classId) return;
        api.get(`/api/assignments?classId=${classId}`)
            .then((data) => {
                setAssignments(data);
                if (data.length > 0 && !selectedAssignment) setSelectedAssignment(data[0]._id);
            })
            .catch((err) => setError(err.message));
    };

    useEffect(() => {
        if (!selectedClass) return;
        api.get(`/api/students?classId=${selectedClass}`).then(setStudents).catch((err) => setError(err.message));
        loadAssignments(selectedClass);
    }, [selectedClass]);

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await api.post("/api/assignments", { title, classId: selectedClass, dueDate });
            setTitle("");
            setDueDate("");
            setShowForm(false);
            loadAssignments(selectedClass);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleSubmitted = async (studentId) => {
        if (!selectedAssignment) return;
        setError("");
        try {
            await api.post("/api/assignments/submit", { assignmentId: selectedAssignment, studentId });
            setSubmittedIds((prev) => new Set(prev).add(studentId));
        } catch (err) {
            // 409 means already marked submitted — treat as success
            if (err.message.includes("409") || err.message.toLowerCase().includes("already")) {
                setSubmittedIds((prev) => new Set(prev).add(studentId));
            } else {
                setError(err.message);
            }
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-semibold text-gray-800">Homework</h1>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    className="text-sm px-3 py-1.5 bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                    {showForm ? "Cancel" : "+ New Assignment"}
                </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">Track assignments and submissions</p>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            {showForm && (
                <form onSubmit={handleCreateAssignment} className="bg-white border border-gray-200 rounded p-4 mb-6 space-y-3">
                    <input
                        type="text" placeholder="Assignment title" required
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                    />
                    <input
                        type="date" required
                        value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                    />
                    <button type="submit" disabled={submitting}
                        className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50">
                        {submitting ? "Creating..." : "Create Assignment"}
                    </button>
                </form>
            )}

            <div className="mb-6 flex gap-4">
                <div>
                    <label className="text-sm text-gray-600 mr-2">Class</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => { setSelectedClass(e.target.value); setSelectedAssignment(""); setSubmittedIds(new Set()); }}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
                    >
                        {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm text-gray-600 mr-2">Assignment</label>
                    <select
                        value={selectedAssignment}
                        onChange={(e) => { setSelectedAssignment(e.target.value); setSubmittedIds(new Set()); }}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
                    >
                        {assignments.length === 0 && <option value="">No assignments yet</option>}
                        {assignments.map((a) => (
                            <option key={a._id} value={a._id}>{a.title} (due {a.dueDate})</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedAssignment && (
                <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
                    {students.map((student) => {
                        const done = submittedIds.has(student._id);
                        return (
                            <div key={student._id} className="flex items-center justify-between px-4 py-3">
                                <span className="text-sm text-gray-800">{student.name}</span>
                                <button
                                    onClick={() => handleToggleSubmitted(student._id)}
                                    disabled={done}
                                    className={`text-xs px-3 py-1 rounded border ${done
                                        ? "bg-green-50 border-green-300 text-green-700 cursor-default"
                                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {done ? "Submitted" : "Mark Submitted"}
                                </button>
                            </div>
                        );
                    })}
                    {students.length === 0 && (
                        <p className="text-sm text-gray-400 px-4 py-6 text-center">No students in this class.</p>
                    )}
                </div>
            )}
        </div>
    );
}