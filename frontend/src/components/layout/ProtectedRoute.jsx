import { Navigate, Outlet, useLocation } from "react-router-dom";
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

  {/* =====================================================
      LOADING
  ===================================================== */}

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0910] text-white flex items-center justify-center">
        <div className="text-sm text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  {/* =====================================================
      NOT AUTHENTICATED
  ===================================================== */}

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

  {/* =====================================================
      USER ROLE
  ===================================================== */}

  const userRole = String(
    user?.role || ""
  ).toLowerCase();

  {/* =====================================================
      ROLE AUTHORIZATION
  ===================================================== */}

  if (
    allowedRoles.length > 0 &&
    !allowedRoles
      .map((role) => String(role).toLowerCase())
      .includes(userRole)
  ) {
    {/* -----------------------------------------------------
        Student trying to access admin page
    ----------------------------------------------------- */}

    if (userRole === "student") {
      return (
        <Navigate
          to="/student-dashboard"
          replace
        />
      );
    }

    {/* -----------------------------------------------------
        Admin trying to access student page
    ----------------------------------------------------- */}

    if (userRole === "admin") {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }

    {/* -----------------------------------------------------
        Faculty
        Faculty dashboard will be implemented later.
    ----------------------------------------------------- */}

    if (userRole === "faculty") {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }

    {/* -----------------------------------------------------
        Unknown role
    ----------------------------------------------------- */}

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  {/* =====================================================
      AUTHORIZED
  ===================================================== */}

  return <Outlet />;
}