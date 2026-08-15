import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import MarkAttendance from "../pages/MarkAttendance";
import Faculty from "../pages/Faculty";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import Settings from '../pages/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      {/* Students */}
      <Route
        path="/students"
        element={<Students />}
      />

      {/* Faculty */}
      <Route
        path="/faculty"
        element={<Faculty />}
      />

      {/* Analytics */}
      <Route
        path="/analytics"
        element={<Analytics />}
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={<Reports />}
      />

      {/* Mark Attendance */}
      <Route
        path="/attendance"
        element={<MarkAttendance />}
      />

      {/* Default */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Unknown URL */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
      {/* Settings */}
      <Route
  path="/settings"
  element={<Settings />}
/>
    </Routes>
  );
}