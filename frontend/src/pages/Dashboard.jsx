import { useEffect, useState } from "react";
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

const attendanceData = [
  {
    name: "A. Khan",
    method: "via FaceID",
    time: "10:15 AM",
    status: "Present",
  },
  {
    name: "A. Sharma",
    method: "Location Mismatch",
    time: "10:16 AM",
    status: "Absent Alert",
  },
  {
    name: "D. Sharma",
    method: "via QR Scan",
    time: "10:18 AM",
    status: "Present",
  },
];

const calendarDays = [
  { day: 1, type: "red" },
  { day: 2, type: "red" },
  { day: 3, type: "green" },
  { day: 4, type: "green" },
  { day: 5, type: "orange" },
  { day: 6, type: "orange" },
  { day: 7, type: "red" },
  { day: 8, type: "green" },
  { day: 9, type: "green" },
  { day: 10, type: "orange" },
  { day: 11, type: "orange" },
  { day: 12, type: "red" },
  { day: 13, type: "green" },
  { day: 14, type: "green" },
  { day: 15, type: "blue" },
  { day: 16, type: "orange" },
  { day: 17, type: "orange" },
  { day: 18, type: "red" },
  { day: 19, type: "green" },
  { day: 20, type: "green" },
];

const chartData = [
  { label: "9 AM", value: 87 },
  { label: "10 AM", value: 96 },
  { label: "11 AM", value: 99 },
  { label: "12 PM", value: 95 },
  { label: "1 PM", value: 83 },
  { label: "2 PM", value: 91 },
  { label: "3 PM", value: 99 },
  { label: "4 PM", value: 94 },
];

function IconButton({ children }) {
  return (
    <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#151820] text-gray-400 transition hover:border-blue-500/40 hover:text-white">
      {children}
    </button>
  );
}

function StatCard({ title, value, subtitle, valueClass = "text-white" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#11141b] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <p className="text-sm font-medium text-gray-500">{title}</p>

      <div className="mt-3 flex items-end justify-between">
        <h2 className={`text-3xl font-semibold tracking-tight ${valueClass}`}>
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

function AttendanceRow({ student }) {
  const present = student.status === "Present";

  return (
    <div className="flex items-center justify-between rounded-xl bg-[#171a22] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#252a35] text-sm font-medium text-gray-300">
          {student.name
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-200">
            {student.name}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            {student.method}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p
          className={`text-xs font-semibold ${
            present ? "text-green-400" : "text-red-400"
          }`}
        >
          {student.status}
        </p>

        <p className="mt-1 text-[11px] text-gray-600">
          {student.time}
        </p>
      </div>
    </div>
  );
}

function AttendanceCalendar() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#11141b] p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Attendance Calendar
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            August 2026
          </p>
        </div>

        <CalendarDays className="h-5 w-5 text-gray-500" />
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
          <span
            key={day}
            className="text-[10px] font-medium text-gray-600"
          >
            {day}
          </span>
        ))}

        {calendarDays.map((item) => {
          const colorMap = {
            green: "bg-green-500/20 text-green-400",
            red: "bg-red-500/20 text-red-400",
            orange: "bg-orange-500/20 text-orange-400",
            blue: "bg-blue-500 text-white",
          };

          return (
            <div
              key={item.day}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${colorMap[item.type]}`}
            >
              {item.day}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
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
      </div>
    </div>
  );
}

function AttendanceChart() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#11141b] p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Attendance Analytics
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Today's attendance trend
          </p>
        </div>

        <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400">
          Aug 15 · 94%
        </span>
      </div>

      <div className="mt-6">
        <div className="relative h-52">
          <div className="absolute inset-0 flex flex-col justify-between">
            {[100, 75, 50, 25, 0].map((value) => (
              <div
                key={value}
                className="flex items-center gap-3"
              >
                <span className="w-8 text-[10px] text-gray-600">
                  {value}%
                </span>

                <div className="h-px flex-1 bg-white/5" />
              </div>
            ))}
          </div>

          <div className="absolute inset-x-11 bottom-0 top-0 flex items-end justify-between gap-2">
            {chartData.map((item) => (
              <div
                key={item.label}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <div
                  className="w-full max-w-8 rounded-t-md bg-blue-500/70 transition hover:bg-blue-400"
                  style={{
                    height: `${item.value * 0.78}%`,
                  }}
                />

                <span className="mt-3 text-[9px] text-gray-600">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await getDashboardAnalytics();

        if (response.success) {
          setAnalytics(response.data);
        } else {
          setError("Failed to load dashboard analytics.");
        }
      } catch (err) {
        console.error("Dashboard analytics error:", err);
        setError("Failed to load dashboard analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#090b0f] lg:flex lg:flex-col">

          {/* Logo */}
          <div className="flex h-20 items-center gap-3 border-b border-white/5 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <ScanFace className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">
                Smart
              </h1>

              <p className="text-sm font-bold text-blue-400">
                Attendance
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-6">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.label === "Students") {
                      navigate("/students");
                    }

                    if (item.label === "Faculty") {
                      navigate("/faculty");
                    }
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    item.active
                      ? "bg-blue-500/15 text-blue-400"
                      : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
                  }`}
                >
                  <Icon className="h-5 w-5" />

                  <span>{item.label}</span>

                  {item.active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Settings */}
          <div className="border-t border-white/5 p-3">
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition hover:bg-white/5 hover:text-gray-200">
              <Settings className="h-5 w-5" />
              Settings
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#0b0d12] px-5 lg:px-8">

            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Automated Student Attendance & Analytics
              </h1>

              <p className="mt-1 text-xs text-gray-500">
                Monitor attendance and academic activity in real time
              </p>
            </div>

            <div className="flex items-center gap-3">

              {/* Search */}
              <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-[#11141b] px-3 py-2 md:flex">
                <Search className="h-4 w-4 text-gray-600" />

                <input
                  type="text"
                  placeholder="Search students, classes..."
                  className="w-48 bg-transparent text-xs text-white outline-none placeholder:text-gray-600"
                />
              </div>

              <IconButton>
                <Bell className="h-4 w-4" />
              </IconButton>

              {/* Profile */}
              <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#11141b] px-2 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xs font-bold">
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

          {/* CONTENT */}
          <div className="p-5 lg:p-8">

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* STATISTICS */}
            <section className="grid gap-4 md:grid-cols-3">

              <StatCard
                title="Total Students"
                value={
                  loading
                    ? "..."
                    : analytics?.total_students ?? 0
                }
                subtitle="All departments"
              />

              <StatCard
                title="Today's Attendance Rate"
                value={
                  loading
                    ? "..."
                    : `${analytics?.attendance_rate ?? 0}%`
                }
                subtitle="Today"
                valueClass="text-green-400"
              />

              <StatCard
                title="Classes in Progress"
                value="23"
                subtitle="8 currently active"
              />

            </section>

            {/* MIDDLE SECTION */}
            <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_1fr_0.9fr]">

              {/* Attendance stream */}
              <div className="rounded-2xl border border-white/10 bg-[#11141b] p-5">

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Real-time Attendance Stream
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Latest attendance activity
                    </p>
                  </div>

                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-green-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    LIVE
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {attendanceData.map((student) => (
                    <AttendanceRow
                      key={`${student.name}-${student.time}`}
                      student={student}
                    />
                  ))}
                </div>

              </div>

              {/* Verification */}
              <div className="rounded-2xl border border-white/10 bg-[#11141b] p-5">

                <h3 className="text-base font-semibold text-white">
                  Focused 2-Step Verification Logic
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Attendance verification pipeline
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2">

                  <div className="rounded-xl bg-[#191c24] p-3 text-center">
                    <ScanFace className="mx-auto h-5 w-5 text-gray-500" />

                    <p className="mt-3 text-[10px] text-gray-400">
                      1. Facial Scan
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-500/15 p-3 text-center ring-1 ring-blue-500/30">
                    <QrCode className="mx-auto h-5 w-5 text-blue-400" />

                    <p className="mt-3 text-[10px] text-blue-300">
                      2. QR Verification
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-500/10 p-3 text-center">
                    <Database className="mx-auto h-5 w-5 text-green-400" />

                    <p className="mt-3 text-[10px] text-green-400">
                      Database Updated
                    </p>
                  </div>

                </div>

                <div className="mt-5 rounded-xl border border-white/5 bg-[#0d0f14] p-4">

                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />

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

              {/* Admin actions */}
              <div className="rounded-2xl border border-white/10 bg-[#11141b] p-5">

                <h3 className="text-base font-semibold text-white">
                  Admin Actions
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Frequently used tools
                </p>

                <div className="mt-5 space-y-3">

                  <button className="flex w-full items-center justify-between rounded-xl bg-[#191c24] px-4 py-3 text-left text-sm font-medium text-blue-400 transition hover:bg-blue-500/10">
                    Generate Class Report
                    <FileText className="h-4 w-4" />
                  </button>

                  <button className="flex w-full items-center justify-between rounded-xl bg-[#191c24] px-4 py-3 text-left text-sm font-medium text-blue-400 transition hover:bg-blue-500/10">
                    Contact At-Risk Students
                    <AlertTriangle className="h-4 w-4" />
                  </button>

                  <button className="flex w-full items-center justify-between rounded-xl bg-[#191c24] px-4 py-3 text-left text-sm font-medium text-blue-400 transition hover:bg-blue-500/10">
                    Classroom Allocation Map
                    <MapPin className="h-4 w-4" />
                  </button>

                </div>

              </div>

            </section>

            {/* BOTTOM SECTION */}
            <section className="mt-5 grid gap-5 lg:grid-cols-[0.75fr_1.5fr]">

              <AttendanceCalendar />

              <AttendanceChart />

            </section>

          </div>
        </main>
      </div>
    </div>
  );
}