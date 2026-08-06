import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const DEFAULT_ROUTE = {
  "school-admin": "/",
  teacher: "/attendance",
  "fee-coordinator": "/fees",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem("user"));
      navigate(DEFAULT_ROUTE[user.role] || "/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded p-6 w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-gray-800">
          Vidya Rakshak Login
        </h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mt-1"
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm mt-1"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
