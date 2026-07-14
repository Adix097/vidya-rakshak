import { useState } from "react";
import { ACCOUNTS } from "./temp";

const ManageAccounts = () => {
  const [accounts, setAccounts] = useState(ACCOUNTS);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("teacher");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const newAccount = { id: Date.now(), name, email, role };
    setAccounts((prev) => [...prev, newAccount]);
    setName("");
    setEmail("");
  };

  const handleRemove = (id) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">
        Manage Accounts
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Teachers and Fee Coordinators for this school
      </p>

      <form
        onSubmit={handleAdd}
        className="bg-white border border-gray-200 rounded p-4 mb-6 space-y-3"
      >
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
          >
            <option value="teacher">Teacher</option>
            <option value="fee-coordinator">Fee Coordinator</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700"
        >
          Add Account
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded divide-y divide-gray-100">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <div className="text-sm text-gray-800">{account.name}</div>
              <div className="text-xs text-gray-500">
                {account.email} — {account.role}
              </div>
            </div>
            <button
              onClick={() => handleRemove(account.id)}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageAccounts;
