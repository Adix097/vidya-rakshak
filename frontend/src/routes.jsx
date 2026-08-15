import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login from "./pages/Login";
import Overview from "./pages/school-admin/Overview";
import ManageAccounts from "./pages/school-admin/ManageAccounts";
import Attendance from "./pages/teacher/Attendance";
import Marks from "./pages/teacher/Marks";
import StudentRisk from "./pages/teacher/StudentRisk";
import FeeStatus from "./pages/fee-coordinator/FeeStatus";
import Layout from "./Components/layout/Layout";
import AttendanceHistory from "./pages/teacher/AttendanceHistory";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["school-admin"]}>
            <Layout>
              <Overview />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts"
        element={
          <ProtectedRoute allowedRoles={["school-admin"]}>
            <Layout>
              <ManageAccounts />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <Layout>
              <Attendance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/marks"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <Layout>
              <Marks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/risk"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <Layout>
              <StudentRisk />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance-history"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <Layout>
              <AttendanceHistory />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/fees"
        element={
          <ProtectedRoute allowedRoles={["fee-coordinator"]}>
            <Layout>
              <FeeStatus />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
