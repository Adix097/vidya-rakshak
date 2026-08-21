import { useState, useEffect } from "react";
import { api } from "../../api/client";

const FEE_STYLES = {
  paid: "bg-green-50 border-green-300 text-green-700",
  unpaid: "bg-red-50 border-red-300 text-red-700",
};

const emptyForm = {
  name: "", gender: "female", age: "", rollNumber: "", classId: "",
  address: "", parentPhone: "",
  tuitionFeeAmount: "", tuitionFeeStatus: "unpaid",
  transportationFeeAmount: "", transportationFeeStatus: "unpaid",
  hasScholarship: false, hasTransportation: false,
};

export default function FeeStatus() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", classId: "", parentPhone: "" });

  useEffect(() => {
    api.get("/api/classes")
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
    api.get(`/api/students?classId=${classId}`).then(setStudents).catch((err) => setError(err.message));
  };

  useEffect(() => { loadStudents(selectedClass); }, [selectedClass]);

  const handleFormChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/api/students", {
        ...form,
        age: Number(form.age),
        tuitionFeeAmount: Number(form.tuitionFeeAmount),
        transportationFeeAmount: Number(form.transportationFeeAmount) || 0,
      });
      setForm({ ...emptyForm, classId: selectedClass });
      setShowForm(false);
      loadStudents(selectedClass);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTuitionChange = async (studentId, tuitionFeeStatus) => {
    setError("");
    try {
      await api.patch(`/api/students/${studentId}/tuition-fee-status`, { tuitionFeeStatus });
      setStudents((prev) => prev.map((s) => (s._id === studentId ? { ...s, tuitionFeeStatus } : s)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTransportationChange = async (studentId, transportationFeeStatus) => {
    setError("");
    try {
      await api.patch(`/api/students/${studentId}/transportation-fee-status`, { transportationFeeStatus });
      setStudents((prev) => prev.map((s) => (s._id === studentId ? { ...s, transportationFeeStatus } : s)));
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (student) => {
    setEditingId(student._id);
    setEditForm({ name: student.name, classId: student.classId?._id || student.classId, parentPhone: student.parentPhone });
  };

  const saveEdit = async (studentId) => {
    setError("");
    try {
      await api.patch(`/api/students/${studentId}`, editForm);
      setEditingId(null);
      loadStudents(selectedClass);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-gray-800">Fee Status</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm px-3 py-1.5 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          {showForm ? "Cancel" : "+ Add Student"}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">Update tuition and transportation fee status per student</p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleAddStudent} className="bg-white border border-gray-200 rounded p-4 mb-6 space-y-3">
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Full name" required
              value={form.name} onChange={(e) => handleFormChange("name", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm" />
            <input type="text" placeholder="Roll number" required
              value={form.rollNumber} onChange={(e) => handleFormChange("rollNumber", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm" />
            <select value={form.gender} onChange={(e) => handleFormChange("gender", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            <input type="number" placeholder="Age" required min="3"
              value={form.age} onChange={(e) => handleFormChange("age", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm" />
            <select value={form.classId} onChange={(e) => handleFormChange("classId", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white col-span-2">
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <input type="text" placeholder="Address" required
              value={form.address} onChange={(e) => handleFormChange("address", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm col-span-2" />
            <input type="tel" placeholder="Parent phone number" required
              value={form.parentPhone} onChange={(e) => handleFormChange("parentPhone", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm col-span-2" />

            <input type="number" placeholder="Tuition fee amount" required min="0"
              value={form.tuitionFeeAmount} onChange={(e) => handleFormChange("tuitionFeeAmount", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm" />
            <select value={form.tuitionFeeStatus} onChange={(e) => handleFormChange("tuitionFeeStatus", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>

            <input type="number" placeholder="Transportation fee amount" min="0"
              value={form.transportationFeeAmount} onChange={(e) => handleFormChange("transportationFeeAmount", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm" />
            <select value={form.transportationFeeStatus} onChange={(e) => handleFormChange("transportationFeeStatus", e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.hasScholarship}
                onChange={(e) => handleFormChange("hasScholarship", e.target.checked)} />
              Has Scholarship
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.hasTransportation}
                onChange={(e) => handleFormChange("hasTransportation", e.target.checked)} />
              Uses Transportation
            </label>
          </div>
          <p className="text-xs text-gray-400">Distance to school is calculated automatically from the address.</p>
          <button type="submit" disabled={submitting}
            className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50">
            {submitting ? "Adding..." : "Add Student"}
          </button>
        </form>
      )}

      <div className="mb-6">
        <label className="text-sm text-gray-600 mr-2">Class</label>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
        {students.map((student) => (
          <div key={student._id} className="px-4 py-3">
            {editingId === student._id ? (
              <div className="space-y-2">
                <input type="text" value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full" />
                <input type="tel" value={editForm.parentPhone}
                  onChange={(e) => setEditForm({ ...editForm, parentPhone: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full" />
                <select value={editForm.classId}
                  onChange={(e) => setEditForm({ ...editForm, classId: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm bg-white w-full">
                  {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(student._id)}
                    className="text-xs px-3 py-1 bg-gray-800 text-white rounded">Save</button>
                  <button onClick={() => setEditingId(null)}
                    className="text-xs px-3 py-1 border border-gray-300 rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-800">{student.name}</div>
                  <div className="text-xs text-gray-500">
                    Tuition ₹{student.tuitionFeeAmount}
                    {student.hasTransportation && ` · Transport ₹${student.transportationFeeAmount}`}
                    {student.hasScholarship && " · Scholarship"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={student.tuitionFeeStatus}
                    onChange={(e) => handleTuitionChange(student._id, e.target.value)}
                    className={`text-xs rounded border px-2 py-1 ${FEE_STYLES[student.tuitionFeeStatus]}`}>
                    <option value="paid">Tuition: Paid</option>
                    <option value="unpaid">Tuition: Unpaid</option>
                  </select>
                  <select value={student.transportationFeeStatus}
                    onChange={(e) => handleTransportationChange(student._id, e.target.value)}
                    className={`text-xs rounded border px-2 py-1 ${FEE_STYLES[student.transportationFeeStatus]}`}>
                    <option value="paid">Transport: Paid</option>
                    <option value="unpaid">Transport: Unpaid</option>
                  </select>
                  <button onClick={() => startEdit(student)}
                    className="text-xs text-gray-500 hover:text-gray-800">Edit</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {students.length === 0 && (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">No students in this class yet.</p>
        )}
      </div>
    </div>
  );
}