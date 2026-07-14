import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// TODO: wire with backend later
const FAKE_USERS = {
  schoolAdmin: { id: 1, name: "Priya Sharma", role: "school-admin" },
  teacher: { id: 2, name: "Kavita Rao", role: "teacher" },
  feeCoordinator: { id: 3, name: "Ramesh Chandra", role: "fee-coordinator" },
  parent: { id: 4, name: "Suresh Kumar", role: "parent" },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(FAKE_USERS.teacher);
  const loginAs = (key) => setUser(FAKE_USERS[key]);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
