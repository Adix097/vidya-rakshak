import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div className="text-sm text-gray-500">
        Signed in as{" "}
        <span className="font-medium text-gray-800">{user.name}</span>{" "}
        <span className="text-gray-400">({user.role})</span>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Log out
      </button>
    </header>
  );
};

export default TopBar;
