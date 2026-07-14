import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login from "./pages/Login";
import Overview from "./pages/school-admin/Overview";
import ManageAccounts from "./pages/school-admin/ManageAccounts";
import Attendance from "./pages/teacher/Attendance";
import Marks from "./pages/teacher/Marks";
import StudentRisk from "./pages/teacher/StudentRisk";
import FeeStatus from "./pages/fee-coordinator/FeeStatus";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["school-admin"]}>
            <Overview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts"
        element={
          <ProtectedRoute allowedRoles={["school-admin"]}>
            <ManageAccounts />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marks"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <Marks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/risk"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <StudentRisk />
          </ProtectedRoute>
        }
      />

      <Route
        path="/fees"
        element={
          <ProtectedRoute allowedRoles={["fee-coordinator"]}>
            <FeeStatus />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
