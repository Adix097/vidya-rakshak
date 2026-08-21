import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const nav_items = {
  "school-admin": [
    { to: "/", label: "Overview" },
    { to: "/accounts", label: "Manage Accounts" },
  ],
  teacher: [
    { to: "/attendance", label: "Attendance" },
    { to: "/marks", label: "Marks" },
    { to: "/homework", label: "Homework" },
    { to: "/risk", label: "Student Risk" },
    { to: "/attendance-history", label: "Attendance History"}
  ],
  "fee-coordinator": [{ to: "/fees", label: "Fee Status" }],
};

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const items = nav_items[user.role] || [];

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="text-sm font-semibold text-gray-500 mb-6 px-2">
        Vidya Rakshak
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm ${
                isActive
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
