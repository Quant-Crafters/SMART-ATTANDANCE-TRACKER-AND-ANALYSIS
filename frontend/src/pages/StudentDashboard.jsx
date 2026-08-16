import {
  Activity,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  QrCode,
  RefreshCw,
  UserRound,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/client";

/* =========================================================
   HELPERS
========================================================= */

function getDateKey(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return getDateKey(new Date());
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name) {
  if (!name) {
    return "S";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  const normalized = String(status).toLowerCase();

  return (
    normalized.charAt(0).toUpperCase() +
    normalized.slice(1)
  );
}

/* =========================================================
   AURORA BACKGROUND
========================================================= */

function AuroraBackground() {
  return (
    <div className="aurora-background">
      <div className="aurora-blob aurora-green" />
      <div className="aurora-blob aurora-blue" />
      <div className="aurora-blob aurora-purple" />
      <div className="aurora-blob aurora-white" />

      <div className="aurora-dark-overlay" />
      <div className="aurora-noise" />
    </div>
  );
}

/* =========================================================
   GLASS CARD
========================================================= */

function GlassCard({
  children,
  className = "",
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.10] bg-[#111018]/75 p-5 shadow-[0_8px_35px_rgba(0,0,0,0.25)] backdrop-blur-xl transition duration-300 hover:border-purple-400/20 hover:bg-[#15131d]/80 ${className}`}
    >
      {children}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass = "text-purple-300",
  iconBackground = "bg-purple-500/10",
  valueClass = "text-white",
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">
            {title}
          </p>

          <h2
            className={`mt-4 text-3xl font-semibold tracking-tight ${valueClass}`}
          >
            {value}
          </h2>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBackground}`}
        >
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>
      </div>

      {subtitle && (
        <p className="mt-5 text-[10px] text-gray-600">
          {subtitle}
        </p>
      )}
    </GlassCard>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

const sidebarItems = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    path: "/student-dashboard",
  },
  {
    label: "My Attendance",
    icon: Activity,
    path: "/student-attendance",
  },
  {
    label: "Scan QR",
    icon: QrCode,
    path: "/mark-attendance",
    live: true,
  },
  {
    label: "Subjects",
    icon: BookOpen,
    path: "/student-subjects",
  },
  {
    label: "Analytics",
    icon: Activity,
    path: "/student-analytics",
  },
];

function Sidebar({
  navigate,
}) {
  const currentPath = window.location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/[0.10] bg-[#09080d]/65 backdrop-blur-2xl lg:flex lg:flex-col">

      {/* LOGO */}
      <div className="flex h-20 items-center gap-3 border-b border-white/[0.07] px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-300 shadow-[0_0_20px_rgba(82,39,255,0.15)]">
          <GraduationCap className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-sm font-bold tracking-tight text-white">
            AttendSmart
          </h1>

          <p className="mt-0.5 text-[10px] text-gray-500">
            Student Portal
          </p>
        </div>
      </div>

      {/* MENU */}
      <div className="px-6 pt-6">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gray-600">
          Menu
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;

          const active =
            currentPath === item.path;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                navigate(item.path)
              }
              className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 ${
                active
                  ? "border-purple-400/30 bg-purple-500/10 text-white shadow-[0_0_20px_rgba(82,39,255,0.12)]"
                  : "border-transparent bg-white/[0.015] text-gray-500 hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  active
                    ? "text-purple-300"
                    : "text-gray-500 group-hover:text-purple-300"
                }`}
              />

              <span>{item.label}</span>

              {item.live && (
                <span className="ml-auto rounded-full bg-purple-500/10 px-2 py-0.5 text-[8px] font-semibold uppercase text-purple-300">
                  Live
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ACCOUNT */}
      <div className="px-6 pt-2">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gray-600">
          Account
        </p>
      </div>

      <div className="space-y-2 p-3">
        <button
          type="button"
          onClick={() =>
            navigate("/student-profile")
          }
          className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-white/[0.015] px-4 py-3 text-sm font-medium text-gray-500 transition hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white"
        >
          <UserRound className="h-4 w-4 text-gray-500 transition group-hover:text-purple-300" />

          My Profile
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-white/[0.015] px-4 py-3 text-sm font-medium text-gray-500 transition hover:border-red-400/10 hover:bg-red-500/5 hover:text-red-300"
        >
          <LogOut className="h-4 w-4 text-gray-500 transition group-hover:text-red-300" />

          Logout
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header({
  student,
  navigate,
}) {
  const today = new Date();

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/[0.08] bg-[#0b0910]/70 px-5 backdrop-blur-2xl lg:px-8">

      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gray-500">
          Student Dashboard
        </p>

        <h1 className="mt-1 text-lg font-semibold tracking-tight text-white">
          Welcome back,{" "}
          {student?.name || "Student"} 👋
        </h1>
      </div>

      <div className="flex items-center gap-3">

        {/* DATE */}
        <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs text-gray-400 backdrop-blur-md md:flex">
          <CalendarDays className="h-4 w-4 text-gray-500" />

          {today.toLocaleDateString([], {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>

        {/* PROFILE */}
        <button
          type="button"
          onClick={() =>
            navigate("/student-profile")
          }
          className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 backdrop-blur-md transition hover:border-purple-400/30 hover:bg-purple-500/10"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-semibold text-purple-200">
            {getInitials(student?.name)}
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-xs font-medium text-white">
              {student?.name || "Student"}
            </p>

            <p className="text-[9px] text-gray-500">
              Student
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}

/* =========================================================
   ATTENDANCE TREND
========================================================= */

function AttendanceTrend({
  attendanceRecords,
}) {
  const trend = useMemo(() => {
    const grouped = {};

    attendanceRecords.forEach((record) => {
      const dateKey =
        getDateKey(record.date);

      if (!dateKey) {
        return;
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          total: 0,
          present: 0,
        };
      }

      grouped[dateKey].total += 1;

      if (
        String(record.status).toLowerCase() ===
        "present"
      ) {
        grouped[dateKey].present += 1;
      }
    });

    return Object.entries(grouped)
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .slice(-7)
      .map(([date, value]) => ({
        date,
        value:
          value.total > 0
            ? Math.round(
                (value.present /
                  value.total) *
                  100
              )
            : 0,
      }));
  }, [attendanceRecords]);

  return (
    <GlassCard className="min-h-[300px]">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
            Attendance Overview
          </p>

          <h3 className="mt-1 text-base font-semibold text-white">
            Your attendance trend
          </h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
          <Activity className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 flex h-52 items-end gap-3 rounded-xl border border-dashed border-white/[0.08] bg-black/10 p-5">

        {trend.length === 0 ? (
          <div className="flex h-full w-full flex-col items-center justify-center text-center">

            <Activity className="h-7 w-7 text-gray-700" />

            <p className="mt-3 text-xs text-gray-500">
              Attendance data will appear here
            </p>

            <p className="mt-1 text-[10px] text-gray-700">
              Once attendance records are available
            </p>
          </div>
        ) : (
          trend.map((item) => (
            <div
              key={item.date}
              className="flex h-full flex-1 flex-col items-center justify-end"
              title={`${formatDate(
                item.date
              )}: ${item.value}%`}
            >
              <span className="mb-2 text-[9px] text-gray-500">
                {item.value}%
              </span>

              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[#5227ff] to-[#b497cf] transition-all duration-500 hover:from-[#5227ff] hover:to-[#7cff67]"
                style={{
                  height: `${Math.max(
                    item.value * 0.72,
                    item.value > 0 ? 4 : 0
                  )}%`,
                }}
              />

              <span className="mt-3 text-[9px] text-gray-600">
                {new Date(
                  item.date
                ).toLocaleDateString([], {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}

/* =========================================================
   STUDENT PROFILE CARD
========================================================= */

function StudentInformation({
  student,
}) {
  const rows = [
    {
      label: "Student ID",
      value:
        student?.student_id ||
        student?.id ||
        "—",
    },
    {
      label: "Department",
      value:
        student?.department_name ||
        student?.department ||
        student?.department_id ||
        "—",
    },
    {
      label: "Semester",
      value:
        student?.semester ??
        "—",
    },
    {
      label: "Section",
      value:
        student?.section ||
        "—",
    },
  ];

  return (
    <GlassCard className="min-h-[300px]">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
            My Profile
          </p>

          <h3 className="mt-1 text-base font-semibold text-white">
            Student information
          </h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
          <UserRound className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 divide-y divide-white/[0.06]">

        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-3"
          >
            <span className="text-[10px] text-gray-600">
              {row.label}
            </span>

            <span className="max-w-[60%] truncate text-right text-xs font-medium text-gray-300">
              {row.value}
            </span>
          </div>
        ))}

      </div>
    </GlassCard>
  );
}

/* =========================================================
   SUBJECT-WISE ATTENDANCE
========================================================= */

function SubjectAttendance({
  attendanceRecords,
}) {
  const subjects = useMemo(() => {
    const grouped = {};

    attendanceRecords.forEach((record) => {
      const subjectId =
        record.subject_id ??
        record.subjectId;

      const key =
        subjectId !== undefined &&
        subjectId !== null
          ? String(subjectId)
          : "unknown";

      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          name:
            record.subject_name ||
            record.subject ||
            `Subject #${key}`,
          total: 0,
          present: 0,
        };
      }

      grouped[key].total += 1;

      if (
        String(record.status).toLowerCase() ===
        "present"
      ) {
        grouped[key].present += 1;
      }
    });

    return Object.values(grouped);
  }, [attendanceRecords]);

  return (
    <GlassCard>

      <div className="flex items-center justify-between">

        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
            Subjects
          </p>

          <h3 className="mt-1 text-base font-semibold text-white">
            Subject-wise attendance
          </h3>
        </div>

        <BookOpen className="h-5 w-5 text-blue-300" />
      </div>

      <div className="mt-5">

        {subjects.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-black/10">

            <BookOpen className="h-7 w-7 text-gray-700" />

            <p className="mt-3 text-xs text-gray-500">
              No subject attendance data
            </p>
          </div>
        ) : (
          <div className="space-y-3">

            {subjects.map((subject) => {
              const percentage =
                subject.total > 0
                  ? Math.round(
                      (subject.present /
                        subject.total) *
                        100
                    )
                  : 0;

              return (
                <div
                  key={subject.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4"
                >

                  <div className="flex items-center justify-between">

                    <span className="truncate text-xs font-medium text-gray-300">
                      {subject.name}
                    </span>

                    <span className="text-xs font-semibold text-purple-300">
                      {percentage}%
                    </span>

                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#5227ff] to-[#b497cf]"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                  <p className="mt-2 text-[9px] text-gray-600">
                    {subject.present} present ·{" "}
                    {subject.total} classes
                  </p>

                </div>
              );
            })}

          </div>
        )}
      </div>
    </GlassCard>
  );
}

/* =========================================================
   RECENT ATTENDANCE
========================================================= */

function RecentAttendance({
  attendanceRecords,
}) {
  const recentRecords = useMemo(() => {
    return [...attendanceRecords]
      .sort((a, b) => {
        return (
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
        );
      })
      .slice(0, 5);
  }, [attendanceRecords]);

  return (
    <GlassCard>

      <div className="flex items-center justify-between">

        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
            Recent Attendance
          </p>

          <h3 className="mt-1 text-base font-semibold text-white">
            Latest records
          </h3>
        </div>

        <Clock3 className="h-5 w-5 text-purple-300" />
      </div>

      <div className="mt-5 space-y-3">

        {recentRecords.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-black/10">

            <Clock3 className="h-7 w-7 text-gray-700" />

            <p className="mt-3 text-xs text-gray-500">
              No attendance records
            </p>

          </div>
        ) : (
          recentRecords.map((record) => {

            const status =
              String(
                record.status || ""
              ).toLowerCase();

            const present =
              status === "present";

            const absent =
              status === "absent";

            return (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 transition hover:border-purple-400/20 hover:bg-purple-500/5"
              >

                <div className="flex min-w-0 items-center gap-3">

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      present
                        ? "bg-green-500/10 text-green-400"
                        : absent
                        ? "bg-red-500/10 text-red-400"
                        : "bg-orange-500/10 text-orange-400"
                    }`}
                  >
                    {present ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : absent ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <Clock3 className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-xs font-medium text-gray-300">
                      {record.subject_name ||
                        record.subject ||
                        (record.subject_id
                          ? `Subject #${record.subject_id}`
                          : "Attendance")}
                    </p>

                    <p className="mt-1 text-[9px] text-gray-600">
                      {formatDate(
                        record.date
                      )}{" "}
                      ·{" "}
                      {formatTime(
                        record.date
                      )}
                    </p>

                  </div>

                </div>

                <span
                  className={`ml-3 text-[10px] font-semibold ${
                    present
                      ? "text-green-400"
                      : absent
                      ? "text-red-400"
                      : "text-orange-400"
                  }`}
                >
                  {formatStatus(status)}
                </span>

              </div>
            );
          })
        )}

      </div>
    </GlassCard>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [student, setStudent] =
    useState(null);

  const [
    analytics,
    setAnalytics,
  ] = useState(null);

  const [
    attendanceRecords,
    setAttendanceRecords,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadStudentDashboard =
    useCallback(async () => {

      try {
        setError("");
        setLoading(true);

        /*
         * IMPORTANT:
         *
         * Your Axios client does NOT automatically add
         * "/api" to requests.
         *
         * Therefore the backend endpoint:
         *
         *   GET http://localhost:8080/api/student/dashboard
         *
         * must be called as:
         *
         *   api.get("/api/student/dashboard")
         *
         * Previously this component called:
         *
         *   api.get("/student/dashboard")
         *
         * which caused:
         *
         *   GET http://localhost:8080/student/dashboard
         *   404 Not Found
         *
         * The backend identifies the student from the JWT.
         * No student ID is sent from the frontend.
         */

        const response =
          await api.get(
            "/api/student/dashboard"
          );

        console.log(
          "STUDENT DASHBOARD RESPONSE:",
          response.data
        );

        /*
         * Expected backend response:
         *
         * {
         *   success: true,
         *   message: "Student dashboard fetched successfully",
         *   data: {
         *     student: {
         *       id: 1,
         *       student_id: "CSE2026001",
         *       name: "Rahul Sharma",
         *       email: "rahul.sharma@example.com",
         *       department: "Computer Science",
         *       semester: 6,
         *       section: "A",
         *       year: 3,
         *       status: true
         *     },
         *
         *     attendance: {
         *       total_classes: 0,
         *       present_classes: 0,
         *       absent_classes: 0,
         *       attendance_rate: 0,
         *       low_attendance: true
         *     }
         *   }
         * }
         */

        const dashboardData =
          response.data?.data;

        if (!dashboardData) {
          throw new Error(
            "Student dashboard data not found."
          );
        }

        const currentStudent =
          dashboardData.student;

        const attendanceData =
          dashboardData.attendance;

        if (!currentStudent) {
          throw new Error(
            "Student profile not found."
          );
        }

        console.log(
          "LOGGED-IN STUDENT:",
          currentStudent
        );

        console.log(
          "STUDENT ATTENDANCE:",
          attendanceData
        );

        /*
         * Save the actual logged-in student.
         */
        setStudent(
          currentStudent
        );

        /*
         * The backend dashboard endpoint currently returns
         * attendance summary statistics.
         */
        setAnalytics(
          attendanceData || null
        );

        /*
         * The dashboard endpoint does not currently return
         * the complete attendance history.
         *
         * Keep this as an empty array so the existing charts,
         * subject section and recent attendance section
         * remain safe.
         */
        setAttendanceRecords([]);

      } catch (err) {

        console.error(
          "Student dashboard error:",
          err
        );

        console.error(
          "STATUS:",
          err?.response?.status
        );

        console.error(
          "BACKEND RESPONSE:",
          err?.response?.data
        );

        const backendMessage =
          err?.response?.data?.message;

        setError(
          backendMessage ||
            err?.message ||
            "Failed to load student dashboard."
        );

      } finally {
        setLoading(false);
      }

    }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    loadStudentDashboard();

    /*
     * Refresh every 30 seconds so the dashboard
     * stays synchronized with the backend.
     */
    const interval =
      setInterval(() => {
        loadStudentDashboard();
      }, 30000);

    return () => {
      clearInterval(interval);
    };

  }, [loadStudentDashboard]);

  /* =======================================================
     STUDENT ATTENDANCE STATS
  ======================================================= */

  const attendanceStats =
    useMemo(() => {

      /*
       * These values now come directly from:
       *
       * /api/student/dashboard
       */

      const present =
        Number(
          analytics?.present_classes ?? 0
        );

      const absent =
        Number(
          analytics?.absent_classes ?? 0
        );

      const total =
        Number(
          analytics?.total_classes ?? 0
        );

      const percentage =
        Number(
          analytics?.attendance_rate ?? 0
        );

      return {
        present,
        absent,
        late: 0,
        total,
        percentage: Math.round(
          Number.isFinite(
            percentage
          )
            ? percentage
            : 0
        ),
      };

    }, [analytics]);

  /* =======================================================
     TODAY
  ======================================================= */

  /*
   * The current student-dashboard endpoint returns
   * overall attendance statistics rather than individual
   * attendance records for today.
   *
   * Keep these at zero until the dedicated history endpoint
   * is connected to this dashboard.
   */

  const todayRecords = [];

  const todayPresent = 0;

  const todayAbsent = 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0910] text-white">

      {/* ANIMATED AURORA */}
      <AuroraBackground />

      <div className="relative z-10 flex min-h-screen">

        {/* SIDEBAR */}
        <Sidebar
          navigate={navigate}
        />

        {/* MAIN */}
        <main className="min-w-0 flex-1">

          {/* HEADER */}
          <Header
            student={student}
            navigate={navigate}
          />

          {/* CONTENT */}
          <div className="p-5 lg:p-8">

            {/* ERROR */}
            {error && (
              <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300 backdrop-blur-xl">

                <div className="flex items-center gap-3">

                  <AlertTriangle className="h-5 w-5 shrink-0" />

                  <div>
                    <p className="font-medium">
                      Unable to load dashboard
                    </p>

                    <p className="mt-1 text-xs text-red-300/70">
                      {error}
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    loadStudentDashboard();
                  }}
                  className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/20"
                >
                  <RefreshCw className="h-4 w-4" />

                  Try Again
                </button>

              </div>
            )}

            {/* =================================================
                HERO
            ================================================= */}

            <section className="mb-6">

              <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">

                <div>

                  <p className="text-[11px] font-medium text-purple-300/80">
                    Your academic overview
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                    Attendance at a glance
                  </h2>

                  <p className="mt-2 max-w-xl text-sm text-gray-500">
                    Monitor your attendance,
                    classes and subjects from
                    one place.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/mark-attendance"
                    )
                  }
                  className="group flex items-center gap-3 rounded-xl border border-purple-400/25 bg-purple-500/10 px-4 py-3 text-left backdrop-blur-md transition-all duration-300 hover:border-purple-300/40 hover:bg-purple-500/20 hover:shadow-[0_0_25px_rgba(82,39,255,0.18)]"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300">
                    <QrCode className="h-5 w-5" />
                  </div>

                  <div>

                    <p className="text-xs font-semibold text-white">
                      Scan Attendance QR
                    </p>

                    <p className="mt-1 text-[9px] text-purple-200/60">
                      Join a live class
                    </p>

                  </div>

                  <ChevronRight className="ml-2 h-4 w-4 text-purple-300 transition group-hover:translate-x-1" />

                </button>

              </div>
            </section>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Attendance"
                value={
                  loading
                    ? "..."
                    : `${attendanceStats.percentage}%`
                }
                subtitle="Overall attendance"
                icon={Activity}
                iconClass="text-blue-300"
                iconBackground="bg-blue-500/10"
                valueClass="text-white"
              />

              <StatCard
                title="Present"
                value={
                  loading
                    ? "..."
                    : attendanceStats.present
                }
                subtitle="Classes attended"
                icon={CheckCircle2}
                iconClass="text-[#7cff67]"
                iconBackground="bg-[#7cff67]/10"
                valueClass="text-white"
              />

              <StatCard
                title="Absent"
                value={
                  loading
                    ? "..."
                    : attendanceStats.absent
                }
                subtitle="Classes missed"
                icon={XCircle}
                iconClass="text-red-300"
                iconBackground="bg-red-500/10"
                valueClass="text-white"
              />

              <StatCard
                title="Total Classes"
                value={
                  loading
                    ? "..."
                    : attendanceStats.total
                }
                subtitle="Recorded classes"
                icon={BookOpen}
                iconClass="text-purple-300"
                iconBackground="bg-purple-500/10"
                valueClass="text-white"
              />

            </section>

            {/* =================================================
                MIDDLE
            ================================================= */}

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_0.8fr]">

              <AttendanceTrend
                attendanceRecords={
                  attendanceRecords
                }
              />

              <StudentInformation
                student={student}
              />

            </section>

            {/* =================================================
                BOTTOM
            ================================================= */}

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">

              <SubjectAttendance
                attendanceRecords={
                  attendanceRecords
                }
              />

              <RecentAttendance
                attendanceRecords={
                  attendanceRecords
                }
              />

            </section>

            {/* =================================================
                TODAY SUMMARY
            ================================================= */}

            <section className="mt-5">

              <GlassCard className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
                    Today
                  </p>

                  <h3 className="mt-1 text-sm font-semibold text-white">
                    Today&apos;s attendance
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {todayRecords.length}{" "}
                    attendance record
                    {todayRecords.length !==
                    1
                      ? "s"
                      : ""}{" "}
                    recorded today.
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <div className="rounded-xl border border-green-400/10 bg-green-500/5 px-4 py-3 text-center">

                    <p className="text-[9px] text-gray-600">
                      Present
                    </p>

                    <p className="mt-1 text-lg font-semibold text-[#7cff67]">
                      {todayPresent}
                    </p>

                  </div>

                  <div className="rounded-xl border border-red-400/10 bg-red-500/5 px-4 py-3 text-center">

                    <p className="text-[9px] text-gray-600">
                      Absent
                    </p>

                    <p className="mt-1 text-lg font-semibold text-red-300">
                      {todayAbsent}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/student-attendance"
                      )
                    }
                    className="group flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-xs font-medium text-gray-300 transition hover:border-purple-400/25 hover:bg-purple-500/10 hover:text-white"
                  >
                    View attendance

                    <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />

                  </button>

                </div>

              </GlassCard>

            </section>

          </div>
        </main>
      </div>
    </div>
  );
}