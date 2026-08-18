import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({
  allowedRoles = [],
}) {
  const {
    user,
    isAuthenticated,
    loading,
  } = useAuth();

  const location = useLocation();

  /* =====================================================
      LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0910] text-white flex items-center justify-center">
        <div className="text-sm text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  /* =====================================================
      NOT AUTHENTICATED
  ===================================================== */

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  /* =====================================================
      GET USER ROLE
  ===================================================== */

  const userRole = String(
    user?.role || ""
  ).toLowerCase();

  /* =====================================================
      ROLE AUTHORIZATION
  ===================================================== */

  if (
    allowedRoles.length > 0 &&
    !allowedRoles
      .map((role) =>
        String(role).toLowerCase()
      )
      .includes(userRole)
  ) {
    /* -----------------------------------------------------
        STUDENT → STUDENT DASHBOARD
    ----------------------------------------------------- */

    if (userRole === "student") {
      return (
        <Navigate
          to="/student-dashboard"
          replace
        />
      );
    }

    /* -----------------------------------------------------
        ADMIN → ADMIN DASHBOARD
    ----------------------------------------------------- */

    if (userRole === "admin") {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }

    /* -----------------------------------------------------
        FACULTY → ADMIN DASHBOARD
        Faculty dashboard can be added later.
    ----------------------------------------------------- */

    if (userRole === "faculty") {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }

    /* -----------------------------------------------------
        UNKNOWN ROLE
    ----------------------------------------------------- */

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* =====================================================
      AUTHORIZED
  ===================================================== */

  return <Outlet />;
}