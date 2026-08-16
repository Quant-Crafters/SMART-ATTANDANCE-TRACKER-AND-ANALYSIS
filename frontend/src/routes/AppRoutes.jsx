import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import Students from "../pages/Students";
import Faculty from "../pages/Faculty";
import MarkAttendance from "../pages/MarkAttendance";
import StudentDashboard from "../pages/StudentDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* =====================================================
          ADMIN ROUTES
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]} />
        }
      >
        {/* Admin Dashboard */}
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

        {/* Mark Attendance */}
        <Route
          path="/mark-attendance"
          element={<MarkAttendance />}
        />
      </Route>

      {/* =====================================================
          STUDENT ROUTES
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["student"]} />
        }
      >
        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />
      </Route>

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}