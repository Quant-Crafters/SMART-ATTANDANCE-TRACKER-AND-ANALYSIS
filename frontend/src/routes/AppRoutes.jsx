import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import Students from "../pages/Students";
import Faculty from "../pages/Faculty";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected - Dashboard */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Protected - Students */}
      <Route element={<ProtectedRoute />}>
        <Route path="/students" element={<Students />} />
      </Route>

      {/* Protected - Faculty */}
      <Route element={<ProtectedRoute />}>
        <Route path="/faculty" element={<Faculty />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}