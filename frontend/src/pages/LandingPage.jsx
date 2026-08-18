import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Lock,
  QrCode,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Users,
  UserRound,
  FileText,
  AlertTriangle,
  Zap,
  Database,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: ScanFace,
      title: "Smart Attendance",
      description:
        "Record attendance through intelligent verification and eliminate repetitive manual entry.",
      color: "purple",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description:
        "Track attendance trends, subject performance and academic patterns from one place.",
      color: "blue",
    },
    {
      icon: GraduationCap,
      title: "Student Portal",
      description:
        "Give students a clear view of their attendance, subjects, trends and academic status.",
      color: "purple",
    },
    {
      icon: Users,
      title: "Faculty Management",
      description:
        "Manage classes, take attendance and monitor student performance effortlessly.",
      color: "green",
    },
    {
      icon: FileText,
      title: "Automated Reports",
      description:
        "Generate comprehensive attendance reports without manually compiling spreadsheets.",
      color: "blue",
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description:
        "Turn attendance patterns into actionable insights and identify students who may need attention.",
      color: "green",
    },
  ];

  const roles = [
    {
      icon: GraduationCap,
      title: "For Students",
      description:
        "Everything students need to stay informed about their attendance and academic progress.",
      items: [
        "View attendance & subject-wise stats",
        "Track attendance trends",
        "Get low-attendance alerts",
        "Stay informed, stay ahead",
      ],
      button: "Explore Student Portal",
      color: "purple",
    },
    {
      icon: UserRound,
      title: "For Faculty",
      description:
        "Powerful tools for faculty to manage classes and attendance with minimal effort.",
      items: [
        "Mark attendance in seconds",
        "Manage classes & subjects",
        "Monitor student attendance",
        "Generate reports effortlessly",
      ],
      button: "Explore Faculty Tools",
      color: "green",
    },
    {
      icon: ShieldCheck,
      title: "For Administrators",
      description:
        "A centralized view of departments, students, faculty and institutional analytics.",
      items: [
        "Monitor departments & sections",
        "Manage students & faculty",
        "View institution-wide analytics",
        "Identify at-risk students",
      ],
      button: "Explore Admin Dashboard",
      color: "blue",
    },
  ];

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#05060b] text-white">
      {/* =====================================================
          AURORA BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="aurora aurora-purple" />
        <div className="aurora aurora-blue" />
        <div className="aurora aurora-green" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(92,52,180,0.18),transparent_42%)]" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <div className="relative z-10">
        {/* ===================================================
            NAVBAR
        =================================================== */}

        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05060b]/70 backdrop-blur-2xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
            {/* Logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/10 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                <Activity className="h-5 w-5 text-purple-300" />
              </div>

              <div className="text-left">
                <div className="text-lg font-bold tracking-tight">
                  Attend<span className="text-blue-500">Smart</span>
                </div>

                <div className="hidden text-[9px] font-medium uppercase tracking-[0.18em] text-gray-500 sm:block">
                  Automated Attendance & Analytics
                </div>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-8 lg:flex">
              <a
                href="#features"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                How It Works
              </a>

              <a
                href="#analytics"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Analytics
              </a>

              <a
                href="#roles"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                For Colleges
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={goToLogin}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                Login
              </button>

              <button
                onClick={goToLogin}
                className="hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold shadow-[0_0_25px_rgba(99,102,241,0.25)] transition hover:scale-[1.02] hover:from-blue-500 hover:to-purple-500 sm:block"
              >
                Get Started
              </button>
            </div>
          </div>
        </header>

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 lg:px-10 lg:pb-24 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
            {/* Hero Copy */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/[0.06] px-4 py-2 text-xs font-medium text-green-300 shadow-[0_0_30px_rgba(34,197,94,0.08)]">
                <Sparkles className="h-3.5 w-3.5" />
                Smarter Attendance. Smarter Institutions.
              </div>

              <h1 className="max-w-3xl text-5xl font-bold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-[68px]">
                Smarter Attendance.
                <br />
                Better Academic{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 bg-clip-text text-transparent">
                  Insights.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
                AttendSmart automates attendance tracking with intelligent
                verification, real-time analytics and actionable insights for
                students, faculty and administrators.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={goToLogin}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3.5 text-sm font-semibold shadow-[0_0_35px_rgba(99,102,241,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(99,102,241,0.4)]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>

                <a
                  href="#how-it-works"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-gray-200 backdrop-blur-xl transition hover:border-purple-400/30 hover:bg-white/[0.06]"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[9px]">
                    ▶
                  </span>
                  See How It Works
                </a>
              </div>

              {/* Trust */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["S", "A", "F", "R"].map((letter, index) => (
                    <div
                      key={index}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#080910] bg-gradient-to-br from-purple-500/80 to-blue-500/80 text-xs font-semibold"
                    >
                      {letter}
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-300">
                    Built for modern institutions
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Simplifying attendance management and academic visibility.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                DASHBOARD PREVIEW
            ================================================= */}

            <div className="relative">
              <div className="absolute -inset-8 rounded-[40px] bg-purple-600/10 blur-3xl" />

              <div className="glass relative overflow-hidden rounded-2xl border border-white/10 p-3 shadow-2xl">
                {/* Preview Header */}
                <div className="flex items-center justify-between px-3 pb-3 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                    <span className="text-xs font-medium text-gray-300">
                      Dashboard Preview
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full border border-green-400/20 bg-green-400/[0.08] px-2.5 py-1 text-[9px] text-green-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    Live
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-[1.15fr_0.7fr_1fr]">
                  {/* Attendance Chart */}
                  <div className="glass rounded-xl border border-white/[0.08] p-4">
                    <div className="text-[9px] uppercase tracking-widest text-gray-500">
                      Overall Attendance
                    </div>

                    <div className="mt-2 flex items-end justify-between">
                      <div className="text-3xl font-bold">87%</div>

                      <div className="text-[9px] text-green-400">
                        ↑ 12% this month
                      </div>
                    </div>

                    <div className="relative mt-5 h-28 overflow-hidden">
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {[1, 2, 3, 4].map((line) => (
                          <div
                            key={line}
                            className="border-t border-white/[0.05]"
                          />
                        ))}
                      </div>

                      <svg
                        viewBox="0 0 300 110"
                        className="absolute inset-0 h-full w-full"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient
                            id="chartGradient"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>

                        <polyline
                          fill="none"
                          stroke="url(#chartGradient)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="0,90 35,72 70,77 105,52 140,61 175,38 210,45 245,22 280,30 300,15"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Present / Absent */}
                  <div className="grid gap-2">
                    <div className="glass rounded-xl border border-white/[0.08] p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[9px] uppercase tracking-widest text-gray-500">
                            Present
                          </div>
                          <div className="mt-2 text-2xl font-bold">42</div>
                          <div className="mt-1 text-[8px] text-gray-600">
                            Classes attended
                          </div>
                        </div>

                        <div className="rounded-lg bg-green-500/10 p-2 text-green-400">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div className="glass rounded-xl border border-white/[0.08] p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[9px] uppercase tracking-widest text-gray-500">
                            Absent
                          </div>
                          <div className="mt-2 text-2xl font-bold">6</div>
                          <div className="mt-1 text-[8px] text-gray-600">
                            Classes missed
                          </div>
                        </div>

                        <div className="rounded-lg bg-red-500/10 p-2 text-red-400">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subject Performance */}
                  <div className="glass rounded-xl border border-white/[0.08] p-4">
                    <div className="text-[9px] uppercase tracking-widest text-gray-500">
                      Subject Performance
                    </div>

                    <div className="mt-4 space-y-3">
                      {[
                        ["DBMS", "91%"],
                        ["Operating Systems", "84%"],
                        ["Data Structures", "82%"],
                        ["Computer Networks", "78%"],
                        ["Software Engineering", "76%"],
                      ].map(([subject, percentage]) => (
                        <div key={subject}>
                          <div className="mb-1 flex justify-between text-[8px]">
                            <span className="text-gray-400">{subject}</span>
                            <span className="text-gray-300">
                              {percentage}
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: percentage }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Preview Cards */}
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="glass rounded-xl border border-white/[0.08] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest text-gray-500">
                        Recent Activity
                      </span>

                      <Activity className="h-3.5 w-3.5 text-purple-400" />
                    </div>

                    <div className="space-y-2">
                      {[
                        ["DBMS", "Today, 10:00 AM", "Present"],
                        ["Operating Systems", "Today, 9:15 AM", "Present"],
                        ["Data Structures", "Yesterday, 2:30 PM", "Absent"],
                      ].map(([subject, time, status]) => (
                        <div
                          key={subject}
                          className="flex items-center justify-between rounded-lg bg-white/[0.025] px-2.5 py-2"
                        >
                          <div>
                            <div className="text-[9px] font-medium text-gray-300">
                              {subject}
                            </div>
                            <div className="text-[8px] text-gray-600">
                              {time}
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-2 py-1 text-[7px] ${
                              status === "Present"
                                ? "bg-green-400/10 text-green-400"
                                : "bg-red-400/10 text-red-400"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass rounded-xl border border-white/[0.08] p-4">
                    <div className="text-[9px] uppercase tracking-widest text-gray-500">
                      Attendance Rate
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-5">
                      <div className="relative h-24 w-24 rounded-full bg-[conic-gradient(#22c55e_0_72%,#ef4444_72%_87%,rgba(255,255,255,0.06)_87%)]">
                        <div className="absolute inset-[9px] flex items-center justify-center rounded-full bg-[#0c0d14]">
                          <div className="text-center">
                            <div className="text-lg font-bold">87%</div>
                            <div className="text-[7px] text-gray-600">
                              This Month
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-[8px]">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-400" />
                          <span className="text-gray-400">Present</span>
                          <span className="text-gray-300">42</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-400" />
                          <span className="text-gray-400">Absent</span>
                          <span className="text-gray-300">6</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            CAPABILITY STRIP
        =================================================== */}

        <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="glass grid overflow-hidden rounded-2xl border border-purple-400/20 sm:grid-cols-2 lg:grid-cols-6">
            {[
              [ScanFace, "Real-time Attendance", "purple"],
              [QrCode, "QR Verification", "blue"],
              [BarChart3, "AI Analytics", "purple"],
              [FileText, "Automated Reports", "green"],
              [AlertTriangle, "At-Risk Detection", "red"],
              [ShieldCheck, "Secure & Reliable", "green"],
            ].map(([Icon, title, color], index) => (
              <div
                key={title}
                className={`flex items-center gap-3 px-5 py-4 ${
                  index !== 0
                    ? "border-t border-white/[0.06] sm:border-l sm:border-t-0"
                    : ""
                }`}
              >
                <div
                  className={`rounded-lg p-2 ${
                    color === "purple"
                      ? "bg-purple-500/10 text-purple-300"
                      : color === "blue"
                      ? "bg-blue-500/10 text-blue-300"
                      : color === "green"
                      ? "bg-green-500/10 text-green-300"
                      : "bg-red-500/10 text-red-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <span className="text-xs font-medium text-gray-300">
                  {title}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================
            PROBLEM VS SOLUTION
        =================================================== */}

        <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
              The Difference
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From Manual to Intelligent
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500">
              Transform the way institutions manage attendance and academic
              visibility.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
            {/* Traditional */}
            <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.04] p-6 shadow-[0_0_50px_rgba(239,68,68,0.04)]">
              <h3 className="text-lg font-semibold text-red-300">
                Traditional Attendance
              </h3>

              <div className="mt-5 space-y-4">
                {[
                  "Manual entry in registers",
                  "Human errors and proxy attendance",
                  "Delayed reports and analysis",
                  "No real-time visibility",
                  "Difficulty tracking defaulters",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-gray-400"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                      ×
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* VS */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-bold text-gray-500">
              VS
            </div>

            {/* AttendSmart */}
            <div className="rounded-2xl border border-green-400/20 bg-green-500/[0.04] p-6 shadow-[0_0_50px_rgba(34,197,94,0.04)]">
              <h3 className="text-lg font-semibold text-green-300">
                AttendSmart Solution
              </h3>

              <div className="mt-5 space-y-4">
                {[
                  "Automated digital attendance",
                  "AI-powered verification & analytics",
                  "Real-time dashboards & reports",
                  "Instant alerts & notifications",
                  "Data-driven academic decisions",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-gray-400"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            FEATURES
        =================================================== */}

        <section
          id="features"
          className="scroll-mt-24 mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10"
        >
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
              Everything You Need
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Core Features
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500">
              Powerful tools to manage attendance and academic performance
              efficiently.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group glass rounded-2xl border border-white/[0.08] p-6 transition duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:bg-white/[0.045]"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      feature.color === "purple"
                        ? "bg-purple-500/10 text-purple-300"
                        : feature.color === "blue"
                        ? "bg-blue-500/10 text-blue-300"
                        : "bg-green-500/10 text-green-300"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 text-base font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {feature.description}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-xs font-medium text-gray-500 transition group-hover:text-purple-300">
                    Learn more
                    <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===================================================
            HOW IT WORKS
        =================================================== */}

        <section
          id="how-it-works"
          className="scroll-mt-24 border-y border-white/[0.05] bg-white/[0.015]"
        >
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
            <div className="text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
                Simple & Secure
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                How AttendSmart Works
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-500">
                A seamless verification and attendance pipeline built for
                modern classrooms.
              </p>
            </div>

            <div className="relative mt-14 grid gap-4 md:grid-cols-4">
              <div className="absolute left-[12%] right-[12%] top-14 hidden h-px bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-green-500/50 md:block" />

              {[
                {
                  number: "01",
                  icon: ScanFace,
                  title: "Facial Scan",
                  description:
                    "Student identity is verified through the attendance verification pipeline.",
                  color: "purple",
                },
                {
                  number: "02",
                  icon: QrCode,
                  title: "QR Verification",
                  description:
                    "A classroom QR code confirms the active class and attendance session.",
                  color: "blue",
                },
                {
                  number: "03",
                  icon: ShieldCheck,
                  title: "Attendance Recorded",
                  description:
                    "The verified attendance is securely recorded in the system.",
                  color: "green",
                },
                {
                  number: "04",
                  icon: BarChart3,
                  title: "Analytics Updated",
                  description:
                    "Dashboards and analytics are updated with the latest attendance data.",
                  color: "blue",
                },
              ].map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="glass relative rounded-2xl border border-white/[0.08] p-6 text-center"
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0c0d14] shadow-xl">
                      <Icon
                        className={`h-7 w-7 ${
                          step.color === "purple"
                            ? "text-purple-400"
                            : step.color === "green"
                            ? "text-green-400"
                            : "text-blue-400"
                        }`}
                      />
                    </div>

                    <div className="mt-4 text-[10px] font-bold tracking-[0.2em] text-gray-600">
                      {step.number}
                    </div>

                    <h3 className="mt-2 text-sm font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================
            ROLES
        =================================================== */}

        <section
          id="roles"
          className="scroll-mt-24 mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10"
        >
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
              One Platform
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Three Perspectives.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-500">
              Powerful features for every role in the academic ecosystem.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon;

              return (
                <div
                  key={role.title}
                  className={`glass group rounded-2xl border p-7 ${
                    role.color === "purple"
                      ? "border-purple-400/20 hover:border-purple-400/40"
                      : role.color === "green"
                      ? "border-green-400/20 hover:border-green-400/40"
                      : "border-blue-400/20 hover:border-blue-400/40"
                  } transition`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      role.color === "purple"
                        ? "bg-purple-500/10 text-purple-300"
                        : role.color === "green"
                        ? "bg-green-500/10 text-green-300"
                        : "bg-blue-500/10 text-blue-300"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {role.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {role.description}
                  </p>

                  <div className="my-6 h-px bg-white/[0.06]" />

                  <div className="space-y-3">
                    {role.items.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-gray-400"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={goToLogin}
                    className="mt-7 flex items-center gap-1 text-xs font-semibold text-purple-300 transition group-hover:text-purple-200"
                  >
                    {role.button}
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===================================================
            ANALYTICS SHOWCASE
        =================================================== */}

        <section
          id="analytics"
          className="scroll-mt-24 mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10"
        >
          <div className="glass overflow-hidden rounded-3xl border border-purple-400/20 p-6 sm:p-8 lg:p-10">
            <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                  <TrendingUp className="h-6 w-6" />
                </div>

                <h2 className="mt-6 text-3xl font-bold leading-tight">
                  Turn Attendance Data
                  <br />
                  into Actionable Insights.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-6 text-gray-500">
                  Visualize trends, analyze performance and make smarter
                  academic decisions with powerful attendance analytics.
                </p>

                <button
                  onClick={goToLogin}
                  className="mt-7 flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold shadow-[0_0_30px_rgba(168,85,247,0.2)] transition hover:bg-purple-500"
                >
                  Explore Analytics
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Analytics UI */}
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Trend */}
                  <div className="glass rounded-xl border border-white/[0.08] p-5">
                    <div className="text-[9px] uppercase tracking-widest text-gray-500">
                      Attendance Trend
                    </div>

                    <div className="mt-2 text-2xl font-bold">87%</div>

                    <div className="mt-5 h-28">
                      <svg
                        viewBox="0 0 400 120"
                        className="h-full w-full"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient
                            id="analyticsGradient"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>

                        <polyline
                          fill="none"
                          stroke="url(#analyticsGradient)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          points="0,105 35,82 70,90 105,60 140,67 175,42 210,50 245,28 280,38 315,18 350,27 400,8"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="glass rounded-xl border border-white/[0.08] p-5">
                    <div className="text-[9px] uppercase tracking-widest text-gray-500">
                      Subject-wise Attendance
                    </div>

                    <div className="mt-4 space-y-3">
                      {[
                        ["DBMS", 91],
                        ["Operating Systems", 84],
                        ["Data Structures", 82],
                        ["Networks", 78],
                        ["Software Engineering", 76],
                      ].map(([subject, value]) => (
                        <div key={subject}>
                          <div className="mb-1 flex justify-between text-[8px]">
                            <span className="text-gray-500">{subject}</span>
                            <span className="text-gray-300">{value}%</span>
                          </div>

                          <div className="h-1.5 rounded-full bg-white/[0.05]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Insight */}
                <div className="flex items-center gap-4 rounded-xl border border-green-400/15 bg-green-400/[0.04] p-4">
                  <div className="rounded-xl bg-green-500/10 p-3 text-green-300">
                    <Brain className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-green-300">
                      Intelligent Insight
                    </div>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Attendance patterns can help institutions identify
                      students who may require timely academic intervention.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            CTA
        =================================================== */}

        <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
          <div className="relative overflow-hidden rounded-3xl border border-purple-400/20 bg-gradient-to-r from-purple-500/[0.08] via-blue-500/[0.06] to-green-500/[0.05] px-6 py-14 text-center sm:px-10">
            <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                <Zap className="h-6 w-6" />
              </div>

              <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
                Ready to make attendance smarter?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm text-gray-500">
                Join AttendSmart and experience a smarter way to manage
                attendance, analytics and academic visibility.
              </p>

              <button
                onClick={goToLogin}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-3.5 text-sm font-semibold shadow-[0_0_35px_rgba(99,102,241,0.25)] transition hover:-translate-y-0.5"
              >
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
              {/* Brand */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-300">
                    <Activity className="h-5 w-5" />
                  </div>

                  <div className="text-lg font-bold">
                    Attend<span className="text-blue-500">Smart</span>
                  </div>
                </div>

                <p className="mt-4 max-w-sm text-xs leading-6 text-gray-600">
                  Automated Student Attendance & Analytics. Making attendance
                  smarter, simpler and more intelligent.
                </p>

                <div className="mt-5 flex gap-2">
                  {["f", "𝕏", "in", "◎"].map((icon) => (
                    <div
                      key={icon}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.02] text-xs text-gray-500"
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>

              {/* Product */}
              <div>
                <h3 className="text-xs font-semibold text-gray-300">
                  Product
                </h3>

                <div className="mt-4 space-y-3 text-xs text-gray-600">
                  <a href="#features" className="block hover:text-gray-300">
                    Features
                  </a>
                  <a href="#analytics" className="block hover:text-gray-300">
                    Analytics
                  </a>
                  <a
                    href="#how-it-works"
                    className="block hover:text-gray-300"
                  >
                    How It Works
                  </a>
                  <a href="#" className="block hover:text-gray-300">
                    Updates
                  </a>
                </div>
              </div>

              {/* Platform */}
              <div>
                <h3 className="text-xs font-semibold text-gray-300">
                  Platform
                </h3>

                <div className="mt-4 space-y-3 text-xs text-gray-600">
                  <a href="#roles" className="block hover:text-gray-300">
                    For Students
                  </a>
                  <a href="#roles" className="block hover:text-gray-300">
                    For Faculty
                  </a>
                  <a href="#roles" className="block hover:text-gray-300">
                    For Administrators
                  </a>
                  <a href="#roles" className="block hover:text-gray-300">
                    For Colleges
                  </a>
                </div>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-xs font-semibold text-gray-300">
                  Resources
                </h3>

                <div className="mt-4 space-y-3 text-xs text-gray-600">
                  <a href="#" className="block hover:text-gray-300">
                    Documentation
                  </a>
                  <a href="#" className="block hover:text-gray-300">
                    Help Center
                  </a>
                  <a href="#" className="block hover:text-gray-300">
                    Privacy Policy
                  </a>
                  <a href="#" className="block hover:text-gray-300">
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-white/[0.05] pt-6 text-center text-[10px] text-gray-700">
              © 2026 AttendSmart. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}