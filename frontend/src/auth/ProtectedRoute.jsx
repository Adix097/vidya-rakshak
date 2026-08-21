import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    // don't redirect back to "/" — that route itself may be role-restricted,
    // which would cause an infinite redirect loop. Send them to their own
    // default page instead.
    const DEFAULT_ROUTE = {
      "school-admin": "/",
      teacher: "/attendance",
      "fee-coordinator": "/fees",
    };
    return <Navigate to={DEFAULT_ROUTE[user.role] || "/login"} replace />;
  }

  return children;
}