import { useState, useEffect } from "react";
import { api } from "../../api/client";

const STATUS_STYLES = {
  paid: "bg-green-50 border-green-300 text-green-700",
  pending: "bg-yellow-50 border-yellow-300 text-yellow-700",
  overdue: "bg-red-50 border-red-300 text-red-700",
};

export default function FeeStatus() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    gender: "female",
    age: "",
    rollNumber: "",
    classId: "",
    address: "",
    feeAmount: "",
    feeStatus: "pending",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    api
      .get("/api/classes")
      .then((data) => {
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0]._id);
          setForm((f) => ({ ...f, classId: data[0]._id }));
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const loadStudents = (classId) => {
    if (!classId) return;
    api
      .get(`/api/students?classId=${classId}`)
      .then(setStudents)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadStudents(selectedClass);
  }, [selectedClass]);

  const handleStatusChange = async (studentId, newStatus) => {
    setError("");
    try {
      await api.patch(`/api/students/${studentId}/fee-status`, {
        feeStatus: newStatus,
      });
      setStudents((prev) =>
        prev.map((s) =>
          s._id === studentId ? { ...s, feeStatus: newStatus } : s,
        ),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormChange = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/api/students", {
        ...form,
        age: Number(form.age),
        feeAmount: Number(form.feeAmount),
      });
      setForm((f) => ({
        ...f,
        name: "",
        age: "",
        rollNumber: "",
        address: "",
        feeAmount: "",
      }));
      setShowForm(false);
      loadStudents(selectedClass);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-gray-800">Fee Status</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm px-3 py-1.5 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          {showForm ? "Cancel" : "+ Add Student"}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Update payment status per student
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {showForm && (
        <form
          onSubmit={handleAddStudent}
          className="bg-white border border-gray-200 rounded p-4 mb-6 space-y-3"
        >
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Full name"
              required
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            />
            <input
              type="text"
              placeholder="Roll number"
              required
              value={form.rollNumber}
              onChange={(e) => handleFormChange("rollNumber", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            />
            <select
              value={form.gender}
              onChange={(e) => handleFormChange("gender", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
            <input
              type="number"
              placeholder="Age"
              required
              min="3"
              max="100"
              value={form.age}
              onChange={(e) => handleFormChange("age", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            />
            <select
              value={form.classId}
              onChange={(e) => handleFormChange("classId", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white col-span-2"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Address"
              required
              value={form.address}
              onChange={(e) => handleFormChange("address", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm col-span-2"
            />
            <input
              type="number"
              placeholder="Fee amount"
              required
              min="0"
              value={form.feeAmount}
              onChange={(e) => handleFormChange("feeAmount", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            />
            <select
              value={form.feeStatus}
              onChange={(e) => handleFormChange("feeStatus", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Student"}
          </button>
        </form>
      )}

      <div className="mb-6">
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

      <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
        {students.map((student) => (
          <div
            key={student._id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <div className="text-sm text-gray-800">{student.name}</div>
              <div className="text-xs text-gray-500">₹{student.feeAmount}</div>
            </div>
            <select
              value={student.feeStatus}
              onChange={(e) => handleStatusChange(student._id, e.target.value)}
              className={`text-xs rounded border px-2 py-1 ${STATUS_STYLES[student.feeStatus]}`}
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        ))}
        {students.length === 0 && (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">
            No students in this class yet.
          </p>
        )}
      </div>
    </div>
  );
}
