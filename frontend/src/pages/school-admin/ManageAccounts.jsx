import { useState, useEffect } from "react";
import { api } from "../../api/client";

export default function ManageAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "teacher" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState("");
  const [classSubmitting, setClassSubmitting] = useState(false);
  const [classError, setClassError] = useState("");

  const loadAccounts = () => {
    api.get("/api/accounts").then(setAccounts).catch((err) => setError(err.message));
  };

  const loadClasses = () => {
    api.get("/api/classes").then(setClasses).catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadAccounts();
    loadClasses();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/api/accounts", form);
      setForm({ name: "", email: "", password: "", role: "teacher" });
      loadAccounts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (account) => {
    setEditingId(account._id);
    setEditForm({ name: account.name, email: account.email });
  };

  const saveEdit = async (id) => {
    setError("");
    try {
      await api.patch(`/api/accounts/${id}`, editForm);
      setEditingId(null);
      loadAccounts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    setClassError("");
    setClassSubmitting(true);
    try {
      await api.post("/api/classes", { name: newClassName });
      setNewClassName("");
      loadClasses();
    } catch (err) {
      setClassError(err.message);
    } finally {
      setClassSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Manage Accounts</h1>
      <p className="text-sm text-gray-500 mb-6">Teachers and Fee Coordinators for this school</p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded p-4 mb-6 space-y-3">
        <div className="flex gap-3">
          <input type="text" placeholder="Full name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" />
          <input type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" />
        </div>
        <div className="flex gap-3">
          <input type="password" placeholder="Password" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
            <option value="teacher">Teacher</option>
            <option value="fee-coordinator">Fee Coordinator</option>
          </select>
        </div>
        <button type="submit" disabled={submitting}
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50">
          {submitting ? "Adding..." : "Add Account"}
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100 mb-8">
        {accounts.map((account) => (
          <div key={account._id} className="px-4 py-3">
            {editingId === account._id ? (
              <div className="space-y-2">
                <input type="text" value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full" />
                <input type="email" value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full" />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(account._id)}
                    className="text-xs px-3 py-1 bg-gray-800 text-white rounded">Save</button>
                  <button onClick={() => setEditingId(null)}
                    className="text-xs px-3 py-1 border border-gray-300 rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-800">{account.name}</div>
                  <div className="text-xs text-gray-500">{account.email} — {account.role}</div>
                </div>
                <button onClick={() => startEdit(account)}
                  className="text-xs text-gray-500 hover:text-gray-800">Edit</button>
              </div>
            )}
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">No accounts yet.</p>
        )}
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">Classes</h2>
      {classError && <p className="text-sm text-red-600 mb-2">{classError}</p>}
      <form onSubmit={handleAddClass} className="flex gap-3 mb-3">
        <input type="text" placeholder="e.g. Class 10A" required
          value={newClassName} onChange={(e) => setNewClassName(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" />
        <button type="submit" disabled={classSubmitting}
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50">
          {classSubmitting ? "Adding..." : "Add Class"}
        </button>
      </form>
      <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
        {classes.map((c) => (
          <div key={c._id} className="px-4 py-2 text-sm text-gray-800">{c.name}</div>
        ))}
        {classes.length === 0 && (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">No classes yet.</p>
        )}
      </div>
    </div>
  );
}