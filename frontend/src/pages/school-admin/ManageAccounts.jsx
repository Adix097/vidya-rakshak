import { useState, useEffect } from "react";
import { api } from "../../api/client";

export default function ManageAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "teacher",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = () => {
    api
      .get("/api/accounts")
      .then(setAccounts)
      .catch((err) => setError(err.message));
  };

  useEffect(loadAccounts, []);

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

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">
        Manage Accounts
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Teachers and Fee Coordinators for this school
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <form
        onSubmit={handleAdd}
        className="bg-white border border-gray-200 rounded p-4 mb-6 space-y-3"
      >
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex gap-3">
          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
          >
            <option value="teacher">Teacher</option>
            <option value="fee-coordinator">Fee Coordinator</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Account"}
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
        {accounts.map((account) => (
          <div
            key={account._id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <div className="text-sm text-gray-800">{account.name}</div>
              <div className="text-xs text-gray-500">
                {account.email} — {account.role}
              </div>
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">
            No accounts yet.
          </p>
        )}
      </div>
    </div>
  );
}
