import { useState } from "react";
import { API_URL } from "../api/client";
import { AuthContext } from "./context";

function getStoredAuth() {
  const savedToken = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (!savedToken || !savedUser) return { token: null, user: null };

  try {
    return { token: savedToken, user: JSON.parse(savedUser) };
  } catch (err) {
    console.error("AuthContext: failed to parse saved user from localStorage", err);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [{ user, token }, setAuth] = useState(getStoredAuth);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Login failed");
    }

    const data = await res.json();
    setAuth({ token: data.token, user: data.user });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}
