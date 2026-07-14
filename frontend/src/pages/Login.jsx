import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    loginAs(role);
    navigate("/");
  };

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">
        Login (temporary role switcher)
      </h1>
      <button
        onClick={() => handleLogin("schoolAdmin")}
        className="block px-4 py-2 bg-gray-800 text-white rounded"
      >
        School Admin
      </button>
      <button
        onClick={() => handleLogin("teacher")}
        className="block px-4 py-2 bg-gray-800 text-white rounded"
      >
        Teacher
      </button>
      <button
        onClick={() => handleLogin("feeCoordinator")}
        className="block px-4 py-2 bg-gray-800 text-white rounded"
      >
        Fee Coordinator
      </button>
    </div>
  );
}
