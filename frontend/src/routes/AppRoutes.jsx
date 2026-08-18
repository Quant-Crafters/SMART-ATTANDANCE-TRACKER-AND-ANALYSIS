import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";

import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import Students from "../pages/Students";
import Faculty from "../pages/Faculty";
import MarkAttendance from "../pages/MarkAttendance";

import StudentDashboard from "../pages/StudentDashboard";

import StudentAttendance from "../pages/StudentAttendance";
import StudentSubjects from "../pages/StudentSubjects";
import StudentAnalytics from "../pages/StudentAnalytics";

export default function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      {/* Landing Page */}
      <Route
        path="/"
        element={<LandingPage />}
      />

      {/* Login */}
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
        {/* Student Dashboard */}
        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        {/* My Attendance */}
        <Route
          path="/student-attendance"
          element={<StudentAttendance />}
        />

        {/* Subjects */}
        <Route
          path="/student-subjects"
          element={<StudentSubjects />}
        />

        {/* Analytics */}
        <Route
          path="/student-analytics"
          element={<StudentAnalytics />}
        />
      </Route>

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}