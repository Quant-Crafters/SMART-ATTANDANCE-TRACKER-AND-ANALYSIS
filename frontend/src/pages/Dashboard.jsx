import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ScanFace,
  BarChart3,
  FileText,
  Settings,
  Search,
  Bell,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Database,
  MapPin,
  CalendarDays,
} from "lucide-react";

import { getDashboardAnalytics } from "../api/analytics.api";
import { getStudents } from "../api/student.api";
import { getAttendance } from "../api/attendance.api";

/* =========================================================
   SIDEBAR
========================================================= */

const sidebarItems = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Students",
    icon: Users,
  },
  {
    label: "Faculty",
    icon: GraduationCap,
  },
  {
    label: "Mark Attendance",
    icon: ScanFace,
  },
  {
    label: "Analytics",
    icon: BarChart3,
  },
  {
    label: "Reports",
    icon: FileText,
  },
];

/* =========================================================
   DATE HELPERS
========================================================= */

function getDateKey(value) {
  if (!value) return null;

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

function formatAttendanceTime(value) {
  if (!value) return "—";

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
  if (!name) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatStatus(status) {
  if (!status) return "Unknown";

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1).toLowerCase()
  );
}

/* =========================================================
   REACT BITS STYLE AURORA
========================================================= */

function AuroraBackground() {
  return (
    <div
      className="aurora-background"
      aria-hidden="true"
    >
      <div className="aurora-blob aurora-green" />
      <div className="aurora-blob aurora-blue" />
      <div className="aurora-blob aurora-purple" />
      <div className="aurora-blob aurora-white" />

      <div className="aurora-noise" />
      <div className="aurora-dark-overlay" />
    </div>
  );
}

/* =========================================================
   GLASS ICON BUTTON
========================================================= */

function IconButton({ children }) {
  return (
    <button
      type="button"
      className="glass-button flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:text-white"
    >
      {children}
    </button>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  valueClass = "text-white",
}) {
  return (
    <div className="rounded-2xl border border-white/[0.10] bg-[#111018]/70 p-5 shadow-[0_8px_35px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-300 hover:border-white/[0.18] hover:bg-[#15131d]/75">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <div className="mt-3 flex items-end justify-between">
        <h2
          className={`text-3xl font-semibold tracking-tight ${valueClass}`}
        >
          {value}
        </h2>

        {subtitle && (
          <span className="text-xs text-gray-500">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ATTENDANCE STREAM
========================================================= */

function AttendanceRow({ student }) {
  const status = String(
    student.status || "unknown"
  ).toLowerCase();

  const present = status === "present";
  const absent = status === "absent";
  const late = status === "late";

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.035] px-4 py-3 backdrop-blur-sm transition hover:border-white/[0.10] hover:bg-white/[0.065]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/[0.08] to-purple-500/[0.10] text-sm font-medium text-gray-300 ring-1 ring-white/[0.06]">
          {getInitials(student.name)}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-200">
            {student.name}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            {student.method}
          </p>
        </div>
      </div>

      <div className="ml-3 text-right">
        <p
          className={`text-xs font-semibold ${
            present
              ? "text-[#7cff67]"
              : absent
              ? "text-red-400"
              : late
              ? "text-orange-400"
              : "text-gray-400"
          }`}
        >
          {formatStatus(status)}
        </p>

        <p className="mt-1 text-[11px] text-gray-600">
          {student.time}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ATTENDANCE CALENDAR
========================================================= */

function AttendanceCalendar({
  attendanceRecords,
  currentDate,
  setCurrentDate,
}) {
  const calendarData = useMemo(() => {
    const grouped = {};

    attendanceRecords.forEach((record) => {
      const dateKey = getDateKey(record.date);

      if (!dateKey) return;

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
        };
      }

      grouped[dateKey].total += 1;

      const status = String(
        record.status || ""
      ).toLowerCase();

      if (status === "present") {
        grouped[dateKey].present += 1;
      }

      if (status === "absent") {
        grouped[dateKey].absent += 1;
      }

      if (status === "late") {
        grouped[dateKey].late += 1;
      }
    });

    return grouped;
  }, [attendanceRecords]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDayOffset =
    (firstDay.getDay() + 6) % 7;

  const days = [];

  for (let i = 0; i < firstDayOffset; i += 1) {
    days.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day += 1
  ) {
    days.push(new Date(year, month, day));
  }

  const monthLabel =
    currentDate.toLocaleDateString([], {
      month: "long",
      year: "numeric",
    });

  const todayKey = getTodayKey();

  const previousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };

  const getDayClasses = (date) => {
    if (!date) return "";

    const key = getDateKey(date);

    if (key === todayKey) {
      return "bg-[#5227ff] text-white shadow-[0_0_15px_rgba(82,39,255,0.35)]";
    }

    const data = calendarData[key];

    if (!data || data.total === 0) {
      return "bg-white/[0.035] text-gray-500";
    }

    const attendanceRate =
      (data.present / data.total) * 100;

    if (attendanceRate >= 75) {
      return "bg-[#7cff67]/15 text-[#7cff67]";
    }

    if (attendanceRate >= 50) {
      return "bg-orange-500/15 text-orange-400";
    }

    return "bg-red-500/15 text-red-400";
  };

  return (
    <div className="rounded-2xl border border-white/[0.10] bg-[#111018]/70 p-5 shadow-[0_8px_35px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Attendance Calendar
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            {monthLabel}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={previousMonth}
            className="glass-button rounded-lg px-2 py-1 text-gray-500 hover:text-white"
          >
            ‹
          </button>

          <CalendarDays className="h-5 w-5 text-purple-300" />

          <button
            type="button"
            onClick={nextMonth}
            className="glass-button rounded-lg px-2 py-1 text-gray-500 hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center">
        {[
          "Mo",
          "Tu",
          "We",
          "Th",
          "Fr",
          "Sa",
          "Su",
        ].map((day) => (
          <span
            key={day}
            className="text-[10px] font-medium text-gray-600"
          >
            {day}
          </span>
        ))}

        {days.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="h-8 w-8"
              />
            );
          }

          const key = getDateKey(date);
          const data = calendarData[key];

          let tooltip =
            "No attendance records";

          if (data) {
            const rate =
              data.total > 0
                ? Math.round(
                    (data.present / data.total) * 100
                  )
                : 0;

            tooltip = `${data.present} present / ${data.total} records (${rate}%)`;
          }

          return (
            <div
              key={key}
              title={tooltip}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition ${getDayClasses(
                date
              )}`}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#7cff67]" />
          Good
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          Moderate
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Low
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#5227ff]" />
          Today
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   ATTENDANCE CHART
========================================================= */

function AttendanceChart({ attendanceRecords }) {
  const chartData = useMemo(() => {
    const todayKey = getTodayKey();

    const todayRecords =
      attendanceRecords.filter(
        (record) =>
          getDateKey(record.date) === todayKey
      );

    const grouped = {};

    todayRecords.forEach((record) => {
      const date = new Date(record.date);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const hour = date.getHours();

      if (!grouped[hour]) {
        grouped[hour] = {
          hour,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
        };
      }

      grouped[hour].total += 1;

      const status = String(
        record.status || ""
      ).toLowerCase();

      if (status === "present") {
        grouped[hour].present += 1;
      }

      if (status === "absent") {
        grouped[hour].absent += 1;
      }

      if (status === "late") {
        grouped[hour].late += 1;
      }
    });

    return Object.values(grouped)
      .sort((a, b) => a.hour - b.hour)
      .map((item) => ({
        ...item,
        value:
          item.total > 0
            ? Math.round(
                (item.present / item.total) * 100
              )
            : 0,
      }));
  }, [attendanceRecords]);

  const todayRate = useMemo(() => {
    const todayKey = getTodayKey();

    const todayRecords =
      attendanceRecords.filter(
        (record) =>
          getDateKey(record.date) === todayKey
      );

    if (todayRecords.length === 0) {
      return 0;
    }

    const present = todayRecords.filter(
      (record) =>
        String(record.status).toLowerCase() ===
        "present"
    ).length;

    return Math.round(
      (present / todayRecords.length) * 100
    );
  }, [attendanceRecords]);

  return (
    <div className="rounded-2xl border border-white/[0.10] bg-[#111018]/70 p-5 shadow-[0_8px_35px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Attendance Analytics
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Today&apos;s attendance trend
          </p>
        </div>

        <span className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300">
          Today · {todayRate}%
        </span>
      </div>

      <div className="mt-6">
        <div className="relative h-52">
          <div className="absolute inset-0 flex flex-col justify-between">
            {[100, 75, 50, 25, 0].map(
              (value) => (
                <div
                  key={value}
                  className="flex items-center gap-3"
                >
                  <span className="w-8 text-[10px] text-gray-600">
                    {value}%
                  </span>

                  <div className="h-px flex-1 bg-white/5" />
                </div>
              )
            )}
          </div>

          <div className="absolute inset-x-11 bottom-0 top-0 flex items-end justify-between gap-2">
            {chartData.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-600">
                No attendance records for today.
              </div>
            ) : (
              chartData.map((item) => {
                const hourLabel =
                  new Date(
                    2000,
                    0,
                    1,
                    item.hour
                  ).toLocaleTimeString([], {
                    hour: "numeric",
                  });

                return (
                  <div
                    key={item.hour}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                    title={`${hourLabel}: ${item.present} present / ${item.total} records`}
                  >
                    <span className="mb-1 text-[9px] text-gray-500">
                      {item.value}%
                    </span>

                    <div
                      className="w-full max-w-8 rounded-t-md bg-gradient-to-t from-[#5227ff]/70 to-[#b497cf] transition-all duration-500 hover:from-[#5227ff] hover:to-[#7cff67]"
                      style={{
                        height: `${Math.max(
                          item.value * 0.78,
                          item.value > 0 ? 4 : 0
                        )}%`,
                      }}
                    />

                    <span className="mt-3 text-[9px] text-gray-600">
                      {hourLabel}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);

  const [attendanceRecords, setAttendanceRecords] =
    useState([]);

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [currentDate, setCurrentDate] =
    useState(new Date());

  /* =======================================================
     FETCH DASHBOARD DATA
  ======================================================= */

  const fetchDashboardData = async () => {
    try {
      setError("");

      const [
        analyticsResponse,
        attendanceResponse,
        studentsResponse,
      ] = await Promise.all([
        getDashboardAnalytics(),
        getAttendance(),
        getStudents(),
      ]);

      const analyticsData =
        analyticsResponse?.data ??
        analyticsResponse;

      const attendanceData =
        attendanceResponse?.data ??
        attendanceResponse;

      const studentsData =
        studentsResponse?.data ??
        studentsResponse;

      if (
        analyticsResponse?.success === false
      ) {
        throw new Error(
          analyticsResponse.message ||
            "Failed to load dashboard analytics."
        );
      }

      if (
        attendanceResponse?.success === false
      ) {
        throw new Error(
          attendanceResponse.message ||
            "Failed to load attendance records."
        );
      }

      if (
        studentsResponse?.success === false
      ) {
        throw new Error(
          studentsResponse.message ||
            "Failed to load students."
        );
      }

      setAnalytics(analyticsData);

      setAttendanceRecords(
        Array.isArray(attendanceData)
          ? attendanceData
          : []
      );

      setStudents(
        Array.isArray(studentsData)
          ? studentsData
          : []
      );
    } catch (err) {
      console.error(
        "Dashboard data error:",
        err
      );

      const backendMessage =
        err?.response?.data?.message;

      setError(
        backendMessage ||
          err?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD + AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* =======================================================
     STUDENT MAP
  ======================================================= */

  const studentMap = useMemo(() => {
    const map = {};

    students.forEach((student) => {
      map[String(student.id)] = student;
    });

    return map;
  }, [students]);

  /* =======================================================
     ATTENDANCE STREAM
  ======================================================= */

  const attendanceStream = useMemo(() => {
    return [...attendanceRecords]
      .sort((a, b) => {
        const dateA = new Date(
          a.date
        ).getTime();

        const dateB = new Date(
          b.date
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5)
      .map((record) => {
        const student =
          studentMap[
            String(record.student_id)
          ];

        const studentName =
          student?.name ||
          `Student #${record.student_id}`;

        let method = "Attendance Record";

        if (record.subject_id) {
          method = `Subject #${record.subject_id}`;
        }

        return {
          id: record.id,
          name: studentName,
          method,
          time: formatAttendanceTime(
            record.date
          ),
          status: formatStatus(
            record.status
          ),
        };
      });
  }, [
    attendanceRecords,
    studentMap,
  ]);

  /* =======================================================
     TODAY'S STATS
  ======================================================= */

  const todayStats = useMemo(() => {
    const todayKey = getTodayKey();

    const todayRecords =
      attendanceRecords.filter(
        (record) =>
          getDateKey(record.date) ===
          todayKey
      );

    const present =
      todayRecords.filter(
        (record) =>
          String(
            record.status
          ).toLowerCase() ===
          "present"
      ).length;

    const absent =
      todayRecords.filter(
        (record) =>
          String(
            record.status
          ).toLowerCase() ===
          "absent"
      ).length;

    const late =
      todayRecords.filter(
        (record) =>
          String(
            record.status
          ).toLowerCase() ===
          "late"
      ).length;

    const total =
      todayRecords.length;

    const rate =
      total > 0
        ? Math.round(
            (present / total) * 100
          )
        : 0;

    return {
      total,
      present,
      absent,
      late,
      rate,
    };
  }, [attendanceRecords]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0910] text-white">
      {/* =====================================================
          REAL ANIMATED AURORA
      ===================================================== */}

      <AuroraBackground />

      {/* =====================================================
          DASHBOARD CONTENT
      ===================================================== */}

      <div className="relative z-10 flex min-h-screen">

        {/* =================================================
            GLASS SIDEBAR
        ================================================= */}

        <aside className="glass-sidebar hidden w-64 shrink-0 lg:flex lg:flex-col">

          {/* SIDEBAR BRAND */}

          <div className="relative flex h-20 items-center gap-3 border-b border-white/[0.06] px-6">
            <div className="glass-logo flex h-10 w-10 items-center justify-center rounded-xl text-purple-300">
              <ScanFace className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">
                Smart
              </h1>

              <p className="text-sm font-bold text-purple-300">
                Attendance
              </p>
            </div>
          </div>

          {/* SIDEBAR NAVIGATION */}

          <nav className="relative z-10 flex-1 space-y-2 px-3 py-6">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => {
                    if (
                      item.label ===
                      "Students"
                    ) {
                      navigate("/students");
                    }

                    if (
                      item.label ===
                      "Faculty"
                    ) {
                      navigate("/faculty");
                    }

                    if (
                      item.label ===
                      "Mark Attendance"
                    ) {
                      navigate(
                        "/mark-attendance"
                      );
                    }

                    if (
                      item.label ===
                      "Analytics"
                    ) {
                      navigate("/analytics");
                    }

                    if (
                      item.label ===
                      "Reports"
                    ) {
                      navigate("/reports");
                    }
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                    item.active
                      ? "glass-nav-item-active text-white"
                      : "glass-nav-item text-gray-500"
                  }`}
                >
                  <Icon
                    className={`relative z-10 h-5 w-5 ${
                      item.active
                        ? "text-purple-300"
                        : "transition-colors group-hover:text-purple-200"
                    }`}
                  />

                  <span className="relative z-10">
                    {item.label}
                  </span>

                  {item.active && (
                    <span className="relative z-10 ml-auto h-2 w-2 rounded-full bg-[#7cff67] shadow-[0_0_10px_rgba(124,255,103,0.8)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* SIDEBAR SETTINGS */}

          <div className="relative z-10 border-t border-white/[0.06] p-3">
            <button
              type="button"
              className="glass-nav-item flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500"
            >
              <Settings className="h-5 w-5 transition-colors group-hover:text-purple-200" />
              Settings
            </button>
          </div>
        </aside>

        {/* =================================================
            MAIN
        ================================================= */}

        <main className="min-w-0 flex-1">

          {/* =================================================
              GLASS TOP BAR
          ================================================= */}

          <header className="glass-topbar flex h-20 items-center justify-between px-5 lg:px-8">

            <div className="relative z-10">
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Automated Student Attendance & Analytics
              </h1>

              <p className="mt-1 text-xs text-gray-500">
                Monitor attendance and academic activity in real time
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3">

              {/* SEARCH */}

              <div className="glass-search hidden items-center gap-2 rounded-xl px-3 py-2 md:flex">
                <Search className="h-4 w-4 text-gray-600" />

                <input
                  type="text"
                  placeholder="Search students, classes..."
                  className="w-48 bg-transparent text-xs text-white outline-none placeholder:text-gray-600"
                />
              </div>

              {/* NOTIFICATIONS */}

              <IconButton>
                <Bell className="h-4 w-4" />
              </IconButton>

              {/* PROFILE */}

              <button
                type="button"
                className="glass-profile flex items-center gap-2 rounded-xl px-2 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#5227ff] to-[#b497cf] text-xs font-bold shadow-[0_0_15px_rgba(82,39,255,0.22)]">
                  AS
                </div>

                <div className="hidden text-left md:block">
                  <p className="text-xs font-medium text-white">
                    Dr. A. Sharma
                  </p>

                  <p className="text-[10px] text-gray-600">
                    Administrator
                  </p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-gray-600 md:block" />
              </button>
            </div>
          </header>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="p-5 lg:p-8">

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 backdrop-blur-md">
                {error}
              </div>
            )}

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="grid gap-4 md:grid-cols-3">

              <StatCard
                title="Total Students"
                value={
                  loading
                    ? "..."
                    : analytics?.total_students ??
                      0
                }
                subtitle="All departments"
              />

              <StatCard
                title="Today's Attendance Rate"
                value={
                  loading
                    ? "..."
                    : `${todayStats.rate}%`
                }
                subtitle="Today"
                valueClass="text-[#7cff67]"
              />

              <StatCard
                title="Total Attendance Records"
                value={
                  loading
                    ? "..."
                    : analytics?.total_attendance ??
                      0
                }
                subtitle="Database"
              />

            </section>

            {/* =================================================
                MIDDLE SECTION
            ================================================= */}

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_1fr_0.9fr]">

              {/* ATTENDANCE STREAM */}

              <div className="rounded-2xl border border-white/[0.10] bg-[#111018]/65 p-5 shadow-[0_8px_35px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-300 hover:border-white/[0.16]">

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Real-time Attendance Stream
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Latest attendance activity
                    </p>
                  </div>

                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#7cff67]">

                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#7cff67] shadow-[0_0_10px_rgba(124,255,103,0.8)]" />

                    LIVE
                  </span>
                </div>

                <div className="mt-5 space-y-3">

                  {loading ? (
                    <div className="rounded-xl bg-white/[0.035] px-4 py-5 text-center text-xs text-gray-600">
                      Loading attendance records...
                    </div>
                  ) : attendanceStream.length === 0 ? (
                    <div className="rounded-xl bg-white/[0.035] px-4 py-5 text-center text-xs text-gray-600">
                      No attendance records found.
                    </div>
                  ) : (
                    attendanceStream.map(
                      (student) => (
                        <AttendanceRow
                          key={student.id}
                          student={student}
                        />
                      )
                    )
                  )}

                </div>
              </div>

              {/* VERIFICATION */}

              <div className="rounded-2xl border border-white/[0.10] bg-[#111018]/65 p-5 shadow-[0_8px_35px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-300 hover:border-white/[0.16]">

                <h3 className="text-base font-semibold text-white">
                  Focused 2-Step Verification Logic
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Attendance verification pipeline
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2">

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.035] p-3 text-center backdrop-blur-sm transition hover:border-white/[0.12] hover:bg-white/[0.055]">

                    <ScanFace className="mx-auto h-5 w-5 text-gray-500" />

                    <p className="mt-3 text-[10px] text-gray-400">
                      1. Facial Scan
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-400/20 bg-purple-500/10 p-3 text-center backdrop-blur-sm transition hover:border-purple-400/30 hover:bg-purple-500/15">

                    <QrCode className="mx-auto h-5 w-5 text-purple-300" />

                    <p className="mt-3 text-[10px] text-purple-200">
                      2. QR Verification
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#7cff67]/10 bg-[#7cff67]/5 p-3 text-center backdrop-blur-sm transition hover:border-[#7cff67]/20 hover:bg-[#7cff67]/10">

                    <Database className="mx-auto h-5 w-5 text-[#7cff67]" />

                    <p className="mt-3 text-[10px] text-[#7cff67]">
                      Database Updated
                    </p>
                  </div>

                </div>

                <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/20 p-4 backdrop-blur-md">

                  <div className="flex items-center gap-3">

                    <CheckCircle2 className="h-5 w-5 text-[#7cff67]" />

                    <div>
                      <p className="text-xs font-medium text-white">
                        Verification Engine Active
                      </p>

                      <p className="mt-1 text-[10px] text-gray-600">
                        All systems operational
                      </p>
                    </div>

                  </div>
                </div>
              </div>

              {/* ADMIN ACTIONS */}

              <div className="rounded-2xl border border-white/[0.10] bg-[#111018]/65 p-5 shadow-[0_8px_35px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-300 hover:border-white/[0.16]">

                <h3 className="text-base font-semibold text-white">
                  Admin Actions
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Frequently used tools
                </p>

                <div className="mt-5 space-y-3">

                  <button
                    type="button"
                    className="glass-button flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-purple-300"
                  >
                    Generate Class Report
                    <FileText className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    className="glass-button flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-purple-300"
                  >
                    Contact At-Risk Students
                    <AlertTriangle className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    className="glass-button flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-purple-300"
                  >
                    Classroom Allocation Map
                    <MapPin className="h-4 w-4" />
                  </button>

                </div>
              </div>

            </section>

            {/* =================================================
                BOTTOM
            ================================================= */}

            <section className="mt-5 grid gap-5 lg:grid-cols-[0.75fr_1.5fr]">

              <AttendanceCalendar
                attendanceRecords={
                  attendanceRecords
                }
                currentDate={currentDate}
                setCurrentDate={
                  setCurrentDate
                }
              />

              <AttendanceChart
                attendanceRecords={
                  attendanceRecords
                }
              />

            </section>

          </div>
        </main>
      </div>
    </div>
  );
}