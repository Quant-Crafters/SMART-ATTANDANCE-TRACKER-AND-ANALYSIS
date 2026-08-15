import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import DashboardLayout from '../components/layout/DashboardLayout';

import {
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  RefreshCw,
  ShieldCheck,
  Activity,
  Target,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  Clock3,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Analytics = () => {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dashboardData, setDashboardData] = useState(null);
  const [overallData, setOverallData] = useState(null);

  const [studentProfile, setStudentProfile] = useState(null);
  const [studentAnalytics, setStudentAnalytics] = useState(null);

  const [subjectAnalytics, setSubjectAnalytics] = useState([]);

  // =========================================================
  // SESSION HELPERS
  // =========================================================

  const getLoggedInUser = () => {
    try {
      const savedUser = localStorage.getItem('user');

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        if (
          parsedUser &&
          typeof parsedUser === 'object'
        ) {
          return parsedUser;
        }
      }
    } catch (error) {
      console.error(
        'Saved user read error:',
        error
      );
    }

    return null;
  };

  const getRoleFromToken = () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        return '';
      }

      const parts = token.split('.');

      if (parts.length !== 3) {
        return '';
      }

      const payload = JSON.parse(
        atob(
          parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        )
      );

      return String(
        payload.role || ''
      ).toLowerCase();
    } catch (error) {
      console.error(
        'JWT role read error:',
        error
      );

      return '';
    }
  };

  // =========================================================
  // SUBJECT ANALYTICS
  // =========================================================

  const loadSubjectAnalytics = async () => {
    try {
      const subjectsResponse =
        await apiClient.get('/subjects/');

      const subjectList =
        subjectsResponse.data?.data || [];

      if (!Array.isArray(subjectList)) {
        setSubjectAnalytics([]);
        return;
      }

      const analyticsResults =
        await Promise.all(
          subjectList.map(
            async (subject) => {
              try {
                const response =
                  await apiClient.get(
                    `/analytics/subjects/${subject.id}`
                  );

                return {
                  ...subject,
                  ...(response.data?.data || {}),
                };
              } catch (error) {
                console.error(
                  `Subject analytics error for ${subject.id}:`,
                  error
                );

                return {
                  ...subject,
                  total_classes: 0,
                  present_records: 0,
                  absent_records: 0,
                  attendance_rate: 0,
                };
              }
            }
          )
        );

      setSubjectAnalytics(
        analyticsResults
      );
    } catch (error) {
      console.error(
        'Subject analytics loading error:',
        error
      );

      setSubjectAnalytics([]);
    }
  };

  // =========================================================
  // LOAD ANALYTICS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const fetchAnalytics = async () => {
      try {
        if (!mounted) return;

        setLoading(true);
        setError('');

        const savedUser =
          getLoggedInUser();

        const savedRole =
          String(
            savedUser?.role || ''
          ).toLowerCase();

        const jwtRole =
          getRoleFromToken();

        const currentRole =
          savedRole || jwtRole;

        console.log(
          'ANALYTICS USER:',
          savedUser
        );

        console.log(
          'ANALYTICS ROLE:',
          currentRole
        );

        if (!currentRole) {
          throw new Error(
            'Your login session could not be identified. Please log in again.'
          );
        }

        if (!mounted) return;

        setRole(currentRole);

        // =====================================================
        // STUDENT
        // =====================================================

        if (
          currentRole === 'student'
        ) {
          const profileResponse =
            await apiClient.get(
              '/students/me'
            );

          const student =
            profileResponse.data?.data;

          if (!student) {
            throw new Error(
              'Student profile could not be loaded.'
            );
          }

          if (!mounted) return;

          setStudentProfile(student);

          const analyticsResponse =
            await apiClient.get(
              `/analytics/students/${student.id}`
            );

          const analytics =
            analyticsResponse.data?.data;

          if (!analytics) {
            throw new Error(
              'Student attendance analytics could not be loaded.'
            );
          }

          if (!mounted) return;

          setStudentAnalytics(
            analytics
          );

          return;
        }

        // =====================================================
        // ADMIN
        // =====================================================

        if (
          currentRole === 'admin'
        ) {
          const [
            dashboardResponse,
            overallResponse,
          ] = await Promise.all([
            apiClient.get(
              '/analytics/dashboard'
            ),
            apiClient.get(
              '/analytics/attendance'
            ),
          ]);

          if (!mounted) return;

          setDashboardData(
            dashboardResponse.data?.data ||
              null
          );

          setOverallData(
            overallResponse.data?.data ||
              null
          );

          await loadSubjectAnalytics();

          return;
        }

        // =====================================================
        // FACULTY
        // =====================================================

        if (
          currentRole === 'faculty'
        ) {
          const overallResponse =
            await apiClient.get(
              '/analytics/attendance'
            );

          if (!mounted) return;

          setOverallData(
            overallResponse.data?.data ||
              null
          );

          await loadSubjectAnalytics();

          return;
        }

        throw new Error(
          `Unsupported account role: ${currentRole}`
        );
      } catch (err) {
        console.error(
          'Analytics page error:',
          err
        );

        console.error(
          'Status:',
          err.response?.status
        );

        console.error(
          'Response:',
          err.response?.data
        );

        if (!mounted) return;

        if (
          err.response?.status === 401
        ) {
          setError(
            'Your session has expired. Please log in again.'
          );
        } else if (
          err.response?.status === 403
        ) {
          setError(
            'Your account does not have permission to view this analytics section.'
          );
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Failed to load analytics.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // CHART DATA
  // =========================================================

  const studentChartData = useMemo(() => {
    if (!studentAnalytics) {
      return [];
    }

    return [
      {
        name: 'Present',
        value:
          Number(
            studentAnalytics.present_classes
          ) || 0,
      },
      {
        name: 'Absent',
        value:
          Number(
            studentAnalytics.absent_classes
          ) || 0,
      },
    ];
  }, [studentAnalytics]);

  const subjectChartData = useMemo(() => {
    return subjectAnalytics.map(
      (subject) => ({
        name:
          subject.code ||
          subject.name ||
          `Subject ${subject.subject_id}`,

        attendance:
          Number(
            subject.attendance_rate || 0
          ),
      })
    );
  }, [subjectAnalytics]);

  const overallRate =
    Number(
      overallData?.attendance_rate || 0
    );

  const studentRate =
    Number(
      studentAnalytics?.attendance_rate ||
        0
    );

  const studentLowAttendance =
    Boolean(
      studentAnalytics?.low_attendance
    );

  const studentAttendanceAngle =
    Math.min(studentRate, 100) * 3.6;

  const studentPresent =
    Number(
      studentAnalytics?.present_classes || 0
    );

  const studentAbsent =
    Number(
      studentAnalytics?.absent_classes || 0
    );

  const studentTotal =
    Number(
      studentAnalytics?.total_classes || 0
    );

  const studentRemaining =
    Math.max(
      0,
      studentTotal -
        studentPresent -
        studentAbsent
    );

  const studentDonutData = [
    {
      name: 'Present',
      value: studentPresent,
    },
    {
      name: 'Absent',
      value: studentAbsent,
    },
  ].filter(
    (item) => item.value > 0
  );

  const reloadPage = () => {
    window.location.reload();
  };

  // =========================================================
  // SHARED STYLES
  // =========================================================

  const card =
    'relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#171c27]/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12]';

  const BackgroundGlow = () => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-blue-600/[0.08] blur-3xl" />

      <div
        className="absolute right-0 top-1/3 h-[28rem] w-[28rem] animate-pulse rounded-full bg-indigo-600/[0.07] blur-3xl"
        style={{
          animationDelay: '1s',
        }}
      />

      <div
        className="absolute bottom-0 left-1/3 h-80 w-80 animate-pulse rounded-full bg-cyan-500/[0.05] blur-3xl"
        style={{
          animationDelay: '2s',
        }}
      />

    </div>
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0a0e17] text-gray-200">

        <BackgroundGlow />

        <DashboardLayout>

          <div className="relative flex min-h-[75vh] items-center justify-center">

            <div className="text-center">

              <div className="relative mx-auto mb-6 h-20 w-20">

                <div className="absolute inset-0 animate-ping rounded-3xl bg-blue-500/10" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-500/20 bg-blue-500/10">

                  <BarChart3
                    size={32}
                    className="text-blue-400"
                  />

                </div>

              </div>

              <h2 className="text-lg font-semibold text-white">
                Building Analytics
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Preparing real-time attendance insights
              </p>

            </div>

          </div>

        </DashboardLayout>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0a0e17] text-gray-200">

        <BackgroundGlow />

        <DashboardLayout>

          <div className="relative mx-auto mt-10 max-w-xl">

            <div className={`${card} p-10 text-center`}>

              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 ring-1 ring-red-500/20">

                <AlertTriangle
                  size={34}
                  className="text-red-400"
                />

              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                Analytics Error
              </p>

              <h2 className="mt-3 text-2xl font-bold text-white">
                Analytics unavailable
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                {error}
              </p>

              <button
                type="button"
                onClick={reloadPage}
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
              >
                <RefreshCw size={16} />
                Reload Analytics
              </button>

            </div>

          </div>

        </DashboardLayout>
      </div>
    );
  }

  // =========================================================
  // STUDENT VIEW
  // =========================================================

  if (role === 'student') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0a0e17] text-gray-200">

        <BackgroundGlow />

        <DashboardLayout>

          <div className="relative">

            {/* ============================================
                HEADER
            ============================================ */}

            <header className="mb-8">

              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

                <div>

                  <div className="mb-3 flex items-center gap-2">

                    <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
                      Personal Intelligence
                    </span>

                  </div>

                  <h1 className="text-4xl font-black tracking-tight text-white">
                    My Attendance
                    <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                      Analytics
                    </span>
                  </h1>

                  <p className="mt-3 text-sm text-gray-500">
                    {studentProfile?.name ||
                      'Student'}
                    {studentProfile?.student_id
                      ? ` • ${studentProfile.student_id}`
                      : ''}
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">

                    <div className="flex items-center gap-2">

                      <ShieldCheck
                        size={17}
                        className="text-emerald-400"
                      />

                      <div>

                        <p className="text-[10px] uppercase tracking-wider text-gray-600">
                          Account
                        </p>

                        <p className="text-xs font-semibold text-emerald-400">
                          Verified
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </header>

            {/* ============================================
                HERO ANALYTICS
            ============================================ */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">

              {/* Gauge */}
              <div className={`${card} xl:col-span-5`}>

                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/[0.07] blur-3xl" />

                <div className="relative p-7">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                        Overall Attendance
                      </p>

                      <h2 className="mt-2 text-xl font-bold text-white">
                        Your Current Standing
                      </h2>

                    </div>

                    <div
                      className={`rounded-xl p-2.5 ${
                        studentLowAttendance
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {studentLowAttendance ? (
                        <AlertTriangle
                          size={20}
                        />
                      ) : (
                        <Target size={20} />
                      )}
                    </div>

                  </div>

                  <div className="relative mx-auto my-9 h-64 w-64">

                    <div
                      className="absolute inset-0 rounded-full transition-all duration-1000"
                      style={{
                        background: `conic-gradient(
                          ${
                            studentLowAttendance
                              ? '#ef4444'
                              : '#10b981'
                          } ${studentAttendanceAngle}deg,
                          rgba(255,255,255,0.045) ${studentAttendanceAngle}deg
                        )`,
                      }}
                    />

                    <div className="absolute inset-[12px] rounded-full bg-[#0d121b]" />

                    <div className="absolute inset-[18px] rounded-full border border-white/[0.04] bg-[#111722] shadow-inner shadow-black/30" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center">

                      <span
                        className={`text-6xl font-black tracking-tight ${
                          studentLowAttendance
                            ? 'text-red-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {studentRate.toFixed(
                          1
                        )}
                        %
                      </span>

                      <span className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-600">
                        Attendance
                      </span>

                    </div>

                  </div>

                  <div className="grid grid-cols-3 gap-3">

                    <div className="rounded-2xl border border-white/[0.04] bg-white/[0.025] p-4 text-center">

                      <p className="text-2xl font-bold text-white">
                        {studentTotal}
                      </p>

                      <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-600">
                        Classes
                      </p>

                    </div>

                    <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.035] p-4 text-center">

                      <p className="text-2xl font-bold text-emerald-400">
                        {studentPresent}
                      </p>

                      <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-600">
                        Present
                      </p>

                    </div>

                    <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.035] p-4 text-center">

                      <p className="text-2xl font-bold text-red-400">
                        {studentAbsent}
                      </p>

                      <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-600">
                        Absent
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* Donut */}
              <div className={`${card} xl:col-span-4`}>

                <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/[0.06] blur-3xl" />

                <div className="relative p-7">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                        Attendance Mix
                      </p>

                      <h2 className="mt-2 text-xl font-bold text-white">
                        Presence Breakdown
                      </h2>

                    </div>

                    <Activity
                      size={20}
                      className="text-indigo-400"
                    />

                  </div>

                  <div className="relative mt-7 h-64">

                    {studentDonutData.length > 0 ? (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <PieChart>

                          <Pie
                            data={
                              studentDonutData
                            }
                            dataKey="value"
                            nameKey="name"
                            innerRadius={75}
                            outerRadius={100}
                            paddingAngle={5}
                            stroke="none"
                            animationDuration={1200}
                          >

                            <Cell fill="#10b981" />

                            <Cell fill="#ef4444" />

                          </Pie>

                          <Tooltip
                            contentStyle={{
                              backgroundColor:
                                '#111722',
                              border:
                                '1px solid rgba(255,255,255,0.08)',
                              borderRadius:
                                '14px',
                              color: '#fff',
                            }}
                          />

                        </PieChart>

                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-600">
                        No attendance data
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">

                      <p className="text-3xl font-black text-white">
                        {studentTotal}
                      </p>

                      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-600">
                        Total Classes
                      </p>

                    </div>

                  </div>

                  <div className="space-y-3">

                    <div className="flex items-center justify-between rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4">

                      <div className="flex items-center gap-3">

                        <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30" />

                        <span className="text-sm text-gray-400">
                          Present
                        </span>

                      </div>

                      <span className="font-bold text-emerald-400">
                        {studentPresent}
                      </span>

                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-4">

                      <div className="flex items-center gap-3">

                        <span className="h-3 w-3 rounded-full bg-red-400 shadow-lg shadow-red-400/30" />

                        <span className="text-sm text-gray-400">
                          Absent
                        </span>

                      </div>

                      <span className="font-bold text-red-400">
                        {studentAbsent}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* Risk / status */}
              <div className={`${card} xl:col-span-3`}>

                <div className="p-7">

                  <div className="mb-6 flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10">

                      <TrendingUp
                        size={20}
                        className="text-cyan-400"
                      />

                    </div>

                    <Sparkles
                      size={18}
                      className="text-indigo-400"
                    />

                  </div>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                    Performance
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-white">
                    {studentLowAttendance
                      ? 'Needs Attention'
                      : 'On Track'}
                  </h2>

                  <div className="mt-6">

                    <div className="flex items-end justify-between">

                      <span className="text-xs text-gray-600">
                        75% target
                      </span>

                      <span
                        className={`text-sm font-bold ${
                          studentLowAttendance
                            ? 'text-red-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {studentRate.toFixed(
                          1
                        )}
                        %
                      </span>

                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/[0.05]">

                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          studentLowAttendance
                            ? 'bg-red-500'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                        }`}
                        style={{
                          width: `${Math.min(
                            studentRate,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                  {studentLowAttendance ? (
                    <div className="mt-7 rounded-2xl border border-red-500/15 bg-red-500/[0.05] p-4">

                      <div className="flex gap-3">

                        <AlertTriangle
                          size={18}
                          className="mt-0.5 shrink-0 text-red-400"
                        />

                        <div>

                          <p className="text-sm font-semibold text-red-400">
                            Attendance Risk
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-400/60">
                            Your attendance is below the required 75% threshold.
                          </p>

                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="mt-7 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] p-4">

                      <div className="flex gap-3">

                        <CheckCircle
                          size={18}
                          className="mt-0.5 shrink-0 text-emerald-400"
                        />

                        <div>

                          <p className="text-sm font-semibold text-emerald-400">
                            Attendance Healthy
                          </p>

                          <p className="mt-1 text-xs leading-5 text-emerald-400/60">
                            You are currently maintaining the required attendance level.
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                  <div className="mt-6 flex items-center gap-2 text-xs text-gray-600">

                    <Clock3 size={14} />

                    Based on recorded classes

                  </div>

                </div>

              </div>

            </div>

            {/* ============================================
                STUDENT HISTORY / SUMMARY
            ============================================ */}

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">

              <div className={`${card} xl:col-span-7`}>

                <div className="border-b border-white/[0.05] p-6">

                  <div className="flex items-center justify-between">

                    <div>

                      <div className="flex items-center gap-2">

                        <BarChart3
                          size={18}
                          className="text-blue-400"
                        />

                        <h3 className="font-semibold text-white">
                          Attendance Breakdown
                        </h3>

                      </div>

                      <p className="mt-1 text-xs text-gray-600">
                        Present vs absent classes
                      </p>

                    </div>

                    <span className="rounded-full border border-blue-500/10 bg-blue-500/[0.05] px-3 py-1.5 text-xs font-semibold text-blue-400">
                      Live
                    </span>

                  </div>

                </div>

                <div className="p-5">

                  {studentChartData.length > 0 ? (
                    <ResponsiveContainer
                      width="100%"
                      height={340}
                    >

                      <BarChart
                        data={
                          studentChartData
                        }
                        barCategoryGap="35%"
                      >

                        <defs>

                          <linearGradient
                            id="presentGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >

                            <stop
                              offset="0%"
                              stopColor="#34d399"
                              stopOpacity={1}
                            />

                            <stop
                              offset="100%"
                              stopColor="#059669"
                              stopOpacity={0.75}
                            />

                          </linearGradient>

                          <linearGradient
                            id="absentGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >

                            <stop
                              offset="0%"
                              stopColor="#fb7185"
                              stopOpacity={1}
                            />

                            <stop
                              offset="100%"
                              stopColor="#dc2626"
                              stopOpacity={0.75}
                            />

                          </linearGradient>

                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#283040"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="name"
                          tick={{
                            fill: '#7c879a',
                            fontSize: 12,
                          }}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{
                            fill: '#7c879a',
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                          dx={-8}
                        />

                        <Tooltip
                          cursor={{
                            fill: 'rgba(255,255,255,0.025)',
                          }}
                          contentStyle={{
                            backgroundColor:
                              '#10151f',
                            border:
                              '1px solid rgba(255,255,255,0.08)',
                            borderRadius:
                              '14px',
                            color: '#fff',
                            boxShadow:
                              '0 20px 40px rgba(0,0,0,0.35)',
                          }}
                        />

                        <Bar
                          dataKey="value"
                          radius={[
                            10,
                            10,
                            4,
                            4,
                          ]}
                          animationDuration={
                            1200
                          }
                        >
                          {studentChartData.map(
                            (entry) => (
                              <Cell
                                key={
                                  entry.name
                                }
                                fill={
                                  entry.name ===
                                  'Present'
                                    ? 'url(#presentGradient)'
                                    : 'url(#absentGradient)'
                                }
                              />
                            )
                          )}
                        </Bar>

                      </BarChart>

                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[340px] items-center justify-center text-sm text-gray-600">
                      No attendance records yet.
                    </div>
                  )}

                </div>

              </div>

              <div className={`${card} xl:col-span-5`}>

                <div className="border-b border-white/[0.05] p-6">

                  <div className="flex items-center gap-2">

                    <GraduationCap
                      size={18}
                      className="text-indigo-400"
                    />

                    <h3 className="font-semibold text-white">
                      Academic Snapshot
                    </h3>

                  </div>

                  <p className="mt-1 text-xs text-gray-600">
                    Your current academic attendance metrics
                  </p>

                </div>

                <div className="space-y-3 p-5">

                  {[
                    {
                      label:
                        'Present Classes',
                      value:
                        studentPresent,
                      icon: CheckCircle,
                      color:
                        'emerald',
                    },
                    {
                      label:
                        'Absent Classes',
                      value:
                        studentAbsent,
                      icon: XCircle,
                      color:
                        'red',
                    },
                    {
                      label:
                        'Attendance Rate',
                      value: `${studentRate.toFixed(
                        1
                      )}%`,
                      icon: TrendingUp,
                      color:
                        'blue',
                    },
                    {
                      label:
                        'Unclassified',
                      value:
                        studentRemaining,
                      icon: Activity,
                      color:
                        'amber',
                    },
                  ].map(
                    ({
                      label,
                      value,
                      icon: Icon,
                      color,
                    }) => (
                      <div
                        key={label}
                        className="group flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]"
                      >

                        <div className="flex items-center gap-3">

                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${color}-500/10`}
                          >

                            <Icon
                              size={18}
                              className={`text-${color}-400`}
                            />

                          </div>

                          <span className="text-sm text-gray-400">
                            {label}
                          </span>

                        </div>

                        <span className="text-lg font-bold text-white">
                          {value}
                        </span>

                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

          </div>

        </DashboardLayout>
      </div>
    );
  }

  // =========================================================
  // ADMIN / FACULTY VIEW
  // =========================================================

  const adminIsHealthy =
    overallRate >= 75;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0e17] text-gray-200">

      <BackgroundGlow />

      <DashboardLayout>

        <div className="relative">

          {/* ============================================
              HEADER
          ============================================ */}

          <header className="mb-8">

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />

                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-400">
                    {role === 'admin'
                      ? 'Command Center'
                      : 'Faculty Intelligence'}
                  </span>

                </div>

                <h1 className="text-4xl font-black tracking-tight text-white">
                  Attendance
                  <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Analytics
                  </span>
                </h1>

                <p className="mt-3 text-sm text-gray-500">
                  {role === 'admin'
                    ? 'Institution-wide attendance intelligence and performance monitoring'
                    : 'Subject-level attendance performance and classroom insights'}
                </p>

              </div>

              <div className="flex items-center gap-3">

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">

                  <div className="flex items-center gap-2">

                    <ShieldCheck
                      size={17}
                      className="text-emerald-400"
                    />

                    <div>

                      <p className="text-[10px] uppercase tracking-wider text-gray-600">
                        Access
                      </p>

                      <p className="text-xs font-semibold text-emerald-400">
                        {role === 'admin'
                          ? 'Administrator'
                          : 'Faculty'}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </header>

          {/* ============================================
              KPI CARDS
          ============================================ */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

            {role === 'admin' && (
              <div className={`${card} group`}>

                <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-blue-500/[0.06] blur-3xl" />

                <div className="relative p-6">

                  <div className="mb-6 flex items-start justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">

                      <Users
                        size={21}
                        className="text-blue-400"
                      />

                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-gray-700 transition group-hover:text-blue-400"
                    />

                  </div>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                    Total Students
                  </p>

                  <p className="mt-3 text-4xl font-black text-white">
                    {dashboardData?.total_students ||
                      0}
                  </p>

                  <p className="mt-2 text-xs text-gray-600">
                    Active student population
                  </p>

                </div>

              </div>
            )}

            <div className={`${card} group`}>

              <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-indigo-500/[0.06] blur-3xl" />

              <div className="relative p-6">

                <div className="mb-6 flex items-start justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">

                    <BarChart3
                      size={21}
                      className="text-indigo-400"
                    />

                  </div>

                  <ArrowUpRight
                    size={18}
                    className="text-gray-700 transition group-hover:text-indigo-400"
                  />

                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Total Records
                </p>

                <p className="mt-3 text-4xl font-black text-white">
                  {overallData?.total_records ||
                    0}
                </p>

                <p className="mt-2 text-xs text-gray-600">
                  Attendance entries recorded
                </p>

              </div>

            </div>

            <div className={`${card} group`}>

              <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-emerald-500/[0.06] blur-3xl" />

              <div className="relative p-6">

                <div className="mb-6 flex items-start justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

                    <CheckCircle
                      size={21}
                      className="text-emerald-400"
                    />

                  </div>

                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Present Records
                </p>

                <p className="mt-3 text-4xl font-black text-emerald-400">
                  {overallData?.present_records ||
                    0}
                </p>

                <p className="mt-2 text-xs text-gray-600">
                  Successfully attended classes
                </p>

              </div>

            </div>

            <div className={`${card} group`}>

              <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-red-500/[0.06] blur-3xl" />

              <div className="relative p-6">

                <div className="mb-6 flex items-start justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">

                    <XCircle
                      size={21}
                      className="text-red-400"
                    />

                  </div>

                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Absent Records
                </p>

                <p className="mt-3 text-4xl font-black text-red-400">
                  {overallData?.absent_records ||
                    0}
                </p>

                <p className="mt-2 text-xs text-gray-600">
                  Missed attendance sessions
                </p>

              </div>

            </div>

          </div>

          {/* ============================================
              OVERALL PERFORMANCE HERO
          ============================================ */}

          <div className={`${card} mt-5`}>

            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/[0.04] to-transparent" />

            <div className="relative p-7">

              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <TrendingUp
                      size={19}
                      className={
                        adminIsHealthy
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }
                    />

                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                      Overall Attendance Rate
                    </p>

                  </div>

                  <h2 className="mt-3 text-3xl font-black text-white">
                    Institution
                    <span className="text-gray-500">
                      {' '}
                      Performance
                    </span>
                  </h2>

                  <p className="mt-2 max-w-xl text-sm text-gray-600">
                    A consolidated view of attendance performance across all recorded sessions.
                  </p>

                </div>

                <div className="text-left lg:text-right">

                  <p
                    className={`text-6xl font-black tracking-tight ${
                      adminIsHealthy
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {overallRate.toFixed(
                      1
                    )}
                    %
                  </p>

                  <p className="mt-2 text-xs uppercase tracking-wider text-gray-600">
                    {adminIsHealthy
                      ? 'Above 75% threshold'
                      : 'Below 75% threshold'}
                  </p>

                </div>

              </div>

              <div className="mt-7">

                <div className="mb-3 flex items-center justify-between text-xs">

                  <span className="text-gray-600">
                    Attendance progress
                  </span>

                  <span
                    className={`font-semibold ${
                      adminIsHealthy
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {Math.min(
                      overallRate,
                      100
                    ).toFixed(1)}
                    %
                  </span>

                </div>

                <div className="h-4 overflow-hidden rounded-full bg-white/[0.04]">

                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      adminIsHealthy
                        ? 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500'
                        : 'bg-gradient-to-r from-red-500 to-orange-400'
                    }`}
                    style={{
                      width: `${Math.min(
                        overallRate,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* ============================================
              SUBJECT ANALYTICS
          ============================================ */}

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">

            {/* Chart */}
            <div className={`${card} xl:col-span-7`}>

              <div className="border-b border-white/[0.05] p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <BookOpen
                        size={19}
                        className="text-blue-400"
                      />

                      <h3 className="font-semibold text-white">
                        Subject Performance
                      </h3>

                    </div>

                    <p className="mt-1 text-xs text-gray-600">
                      Attendance rate by subject
                    </p>

                  </div>

                  <span className="rounded-full border border-blue-500/10 bg-blue-500/[0.05] px-3 py-1.5 text-xs font-semibold text-blue-400">
                    Live Data
                  </span>

                </div>

              </div>

              <div className="p-5">

                {subjectChartData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={360}
                  >

                    <BarChart
                      data={
                        subjectChartData
                      }
                      barCategoryGap="25%"
                    >

                      <defs>

                        <linearGradient
                          id="subjectBarGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >

                          <stop
                            offset="0%"
                            stopColor="#60a5fa"
                            stopOpacity={1}
                          />

                          <stop
                            offset="100%"
                            stopColor="#4f46e5"
                            stopOpacity={0.65}
                          />

                        </linearGradient>

                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#273142"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: '#7c879a',
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />

                      <YAxis
                        domain={[0, 100]}
                        tick={{
                          fill: '#7c879a',
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                        dx={-8}
                      />

                      <Tooltip
                        cursor={{
                          fill: 'rgba(255,255,255,0.025)',
                        }}
                        contentStyle={{
                          backgroundColor:
                            '#10151f',
                          border:
                            '1px solid rgba(255,255,255,0.08)',
                          borderRadius:
                            '14px',
                          color: '#fff',
                          boxShadow:
                            '0 20px 50px rgba(0,0,0,0.35)',
                        }}
                        formatter={(value) => [
                          `${value}%`,
                          'Attendance',
                        ]}
                      />

                      <Bar
                        dataKey="attendance"
                        fill="url(#subjectBarGradient)"
                        radius={[
                          10,
                          10,
                          4,
                          4,
                        ]}
                        animationDuration={
                          1200
                        }
                      />

                    </BarChart>

                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[360px] flex-col items-center justify-center text-center">

                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">

                      <BookOpen
                        size={27}
                        className="text-gray-700"
                      />

                    </div>

                    <p className="text-sm font-medium text-gray-500">
                      No subject analytics yet
                    </p>

                    <p className="mt-1 text-xs text-gray-700">
                      Attendance data will appear here once classes are recorded.
                    </p>

                  </div>
                )}

              </div>

            </div>

            {/* Subject cards */}
            <div className="space-y-3 xl:col-span-5">

              {subjectAnalytics.length >
              0 ? (
                subjectAnalytics.map(
                  (subject) => {
                    const rate =
                      Number(
                        subject.attendance_rate ||
                          0
                      );

                    const healthy =
                      rate >= 75;

                    return (
                      <div
                        key={
                          subject.id ||
                          subject.subject_id
                        }
                        className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#171c27]/90 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]"
                      >

                        <div
                          className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${
                            healthy
                              ? 'bg-emerald-500/[0.05]'
                              : 'bg-red-500/[0.05]'
                          }`}
                        />

                        <div className="relative">

                          <div className="flex items-start justify-between">

                            <div>

                              <div className="flex items-center gap-2">

                                <span className="rounded-lg bg-blue-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                                  {subject.code ||
                                    'SUB'}
                                </span>

                              </div>

                              <p className="mt-3 font-semibold text-white">
                                {subject.name ||
                                  'Subject'}
                              </p>

                            </div>

                            <div className="text-right">

                              <p
                                className={`text-2xl font-black ${
                                  healthy
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                                }`}
                              >
                                {rate.toFixed(
                                  1
                                )}
                                %
                              </p>

                              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-600">
                                attendance
                              </p>

                            </div>

                          </div>

                          <div className="mt-5 flex items-center justify-between text-[10px] text-gray-600">

                            <span>
                              {subject.total_classes ||
                                0}{' '}
                              classes
                            </span>

                            <span
                              className={
                                healthy
                                  ? 'text-emerald-400'
                                  : 'text-red-400'
                              }
                            >
                              {healthy
                                ? 'Healthy'
                                : 'At Risk'}
                            </span>

                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.04]">

                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                healthy
                                  ? 'bg-emerald-500'
                                  : 'bg-red-500'
                              }`}
                              style={{
                                width: `${Math.min(
                                  rate,
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                      </div>
                    );
                  }
                )
              ) : (
                <div className={`${card} flex min-h-[360px] items-center justify-center p-8 text-center`}>

                  <div>

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">

                      <GraduationCap
                        size={28}
                        className="text-gray-700"
                      />

                    </div>

                    <p className="text-sm font-medium text-gray-500">
                      No subjects available
                    </p>

                  </div>

                </div>
              )}

            </div>

          </div>

          {/* ============================================
              ADMIN DAILY SUMMARY
          ============================================ */}

          {role === 'admin' &&
            dashboardData && (
              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">

                <div className="rounded-[24px] border border-white/[0.06] bg-[#171c27] p-6">

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">
                    Total Attendance
                  </p>

                  <p className="mt-3 text-4xl font-black text-white">
                    {dashboardData.total_attendance ||
                      0}
                  </p>

                  <p className="mt-2 text-xs text-gray-600">
                    All recorded attendance events
                  </p>

                </div>

                <div className="rounded-[24px] border border-emerald-500/10 bg-emerald-500/[0.025] p-6">

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">
                    Present Today
                  </p>

                  <p className="mt-3 text-4xl font-black text-emerald-400">
                    {dashboardData.present_today ||
                      0}
                  </p>

                  <p className="mt-2 text-xs text-gray-600">
                    Today's successful attendance
                  </p>

                </div>

                <div className="rounded-[24px] border border-red-500/10 bg-red-500/[0.025] p-6">

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">
                    Absent Today
                  </p>

                  <p className="mt-3 text-4xl font-black text-red-400">
                    {dashboardData.absent_today ||
                      0}
                  </p>

                  <p className="mt-2 text-xs text-gray-600">
                    Today's absent records
                  </p>

                </div>

              </div>
            )}

        </div>

      </DashboardLayout>
    </div>
  );
};

export default Analytics;