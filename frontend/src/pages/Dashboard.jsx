import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import apiClient from '../api/client';
import DashboardLayout from '../components/layout/DashboardLayout';

import {
  Search,
  Bell,
  Users,
  TrendingUp,
  Activity,
  ShieldCheck,
  ScanFace,
  MapPin,
  CalendarCheck2,
  FileText,
  UserRoundCheck,
  ArrowUpRight,
  CheckCheck,
  X,
} from 'lucide-react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [students, setStudents] =
    useState([]);

  const [attendanceRecords, setAttendanceRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [profileName, setProfileName] =
    useState('');

  const [profileRole, setProfileRole] =
    useState('');

  const [
    isNotificationsOpen,
    setIsNotificationsOpen,
  ] = useState(false);

  const [
    readNotifications,
    setReadNotifications,
  ] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          'attendsmart_read_notifications'
        );

      if (!saved) {
        return [];
      }

      const parsed =
        JSON.parse(saved);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  });

  // =====================================================
  // GET ROLE FROM TOKEN
  // =====================================================

  const getRoleFromToken = () => {
    try {
      const token =
        localStorage.getItem('token');

      if (!token) {
        return '';
      }

      const parts =
        token.split('.');

      if (parts.length !== 3) {
        return '';
      }

      const payload =
        JSON.parse(
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
        'Role read error:',
        error
      );

      return '';
    }
  };

  const userRole =
    getRoleFromToken();

  // =====================================================
  // LOAD LOGGED-IN USER PROFILE
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadUserProfile = async () => {
      try {
        const savedUser =
          localStorage.getItem(
            'user'
          );

        let user = null;

        if (savedUser) {
          try {
            user =
              JSON.parse(
                savedUser
              );
          } catch (error) {
            console.error(
              'Saved user parse error:',
              error
            );
          }
        }

        const tokenRole =
          getRoleFromToken();

        const role =
          String(
            user?.role ||
              tokenRole ||
              ''
          ).toLowerCase();

        if (!mounted) {
          return;
        }

        setProfileRole(
          role
        );

        // -----------------------------------------------
        // If login already supplied the name
        // -----------------------------------------------

        if (user?.name) {
          setProfileName(
            user.name
          );

          return;
        }

        // -----------------------------------------------
        // Student profile fallback
        // -----------------------------------------------

        if (
          role === 'student'
        ) {
          try {
            const response =
              await apiClient.get(
                '/students/me'
              );

            const student =
              response.data?.data;

            if (
              student?.name &&
              mounted
            ) {
              setProfileName(
                student.name
              );

              const updatedUser = {
                ...(user || {}),
                id: student.id,
                name: student.name,
                email: student.email,
                role: 'student',
              };

              localStorage.setItem(
                'user',
                JSON.stringify(
                  updatedUser
                )
              );

              return;
            }
          } catch (error) {
            console.error(
              'Student profile fetch error:',
              error
            );
          }
        }

        // -----------------------------------------------
        // Faculty profile fallback
        // -----------------------------------------------

        if (
          role === 'faculty'
        ) {
          try {
            const response =
              await apiClient.get(
                '/faculty/me'
              );

            const faculty =
              response.data?.data;

            if (
              faculty?.name &&
              mounted
            ) {
              setProfileName(
                faculty.name
              );

              const updatedUser = {
                ...(user || {}),
                id: faculty.id,
                name: faculty.name,
                email: faculty.email,
                role: 'faculty',
              };

              localStorage.setItem(
                'user',
                JSON.stringify(
                  updatedUser
                )
              );

              return;
            }
          } catch (error) {
            console.error(
              'Faculty profile fetch error:',
              error
            );
          }
        }

        // -----------------------------------------------
        // Final fallback
        // -----------------------------------------------

        if (mounted) {
          setProfileName(
            user?.name ||
              user?.email ||
              'AttendSmart User'
          );
        }
      } catch (error) {
        console.error(
          'Dashboard profile error:',
          error
        );

        if (!mounted) {
          return;
        }

        setProfileName(
          'AttendSmart User'
        );

        setProfileRole(
          userRole || ''
        );
      }
    };

    loadUserProfile();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // PROFILE ROLE LABEL
  // =====================================================

  const profileRoleLabel =
    useMemo(() => {
      switch (
        profileRole
      ) {
        case 'admin':
          return 'Administrator';

        case 'faculty':
          return 'Faculty';

        case 'student':
          return 'Student';

        default:
          return 'User';
      }
    }, [profileRole]);

  // =====================================================
  // PROFILE INITIALS
  // =====================================================

  const profileInitials =
    useMemo(() => {
      const name =
        profileName?.trim();

      if (!name) {
        return 'AS';
      }

      const parts =
        name.split(/\s+/);

      if (parts.length === 1) {
        return parts[0]
          .slice(0, 2)
          .toUpperCase();
      }

      return (
        parts[0].charAt(0) +
        parts[
          parts.length - 1
        ].charAt(0)
      ).toUpperCase();
    }, [profileName]);

  // =====================================================
  // NAVIGATION HELPERS
  // =====================================================

  const goToStudents = () => {
    navigate('/students');
  };

  const goToAttendance = () => {
    navigate('/attendance');
  };

  const goToReports = () => {
    navigate('/reports');
  };

  const goToAnalytics = () => {
    navigate('/analytics');
  };

  const goToSettings = () => {
    navigate('/settings');
  };

  const goToAtRiskStudents = () => {
    if (
      userRole !== 'admin'
    ) {
      return;
    }

    navigate(
      '/students?attendance=low'
    );
  };

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData =
      async () => {
        try {
          if (!mounted) {
            return;
          }

          setLoading(true);

          const [
            studentsResponse,
            attendanceResponse,
          ] = await Promise.all([
            apiClient.get(
              '/students'
            ),
            apiClient.get(
              '/attendance'
            ),
          ]);

          console.log(
            'DASHBOARD STUDENTS:',
            studentsResponse.data
          );

          console.log(
            'DASHBOARD ATTENDANCE:',
            attendanceResponse.data
          );

          if (!mounted) {
            return;
          }

          setStudents(
            studentsResponse.data?.data ||
              []
          );

          setAttendanceRecords(
            attendanceResponse.data?.data ||
              []
          );
        } catch (error) {
          console.error(
            'Dashboard error:',
            error
          );

          console.error(
            'Status:',
            error.response?.status
          );

          console.error(
            'Response:',
            error.response?.data
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // TOTAL STUDENTS
  // =====================================================

  const totalStudents =
    students.length;

  // =====================================================
  // TODAY ATTENDANCE
  // =====================================================

  const todayAttendance =
    useMemo(() => {
      const today =
        new Date();

      const todayString =
        today
          .toISOString()
          .split('T')[0];

      const todayRecords =
        attendanceRecords.filter(
          (record) => {
            if (!record.date) {
              return false;
            }

            const recordDate =
              new Date(record.date)
                .toISOString()
                .split('T')[0];

            return (
              recordDate ===
              todayString
            );
          }
        );

      if (
        todayRecords.length ===
        0
      ) {
        return 0;
      }

      const presentCount =
        todayRecords.filter(
          (record) =>
            String(
              record.status
            ).toLowerCase() ===
            'present'
        ).length;

      return Math.round(
        (presentCount /
          todayRecords.length) *
          100
      );
    }, [
      attendanceRecords,
    ]);

  // =====================================================
  // ATTENDANCE CHART
  // =====================================================

  const chartData =
    useMemo(() => {
      const groupedByDate =
        {};

      attendanceRecords.forEach(
        (record) => {
          if (!record.date) {
            return;
          }

          const date =
            new Date(
              record.date
            );

          const dateKey =
            date
              .toISOString()
              .split('T')[0];

          if (
            !groupedByDate[
              dateKey
            ]
          ) {
            groupedByDate[
              dateKey
            ] = {
              total: 0,
              present: 0,
            };
          }

          groupedByDate[
            dateKey
          ].total += 1;

          if (
            String(
              record.status
            ).toLowerCase() ===
            'present'
          ) {
            groupedByDate[
              dateKey
            ].present += 1;
          }
        }
      );

      return Object.entries(
        groupedByDate
      )
        .sort(
          (
            [dateA],
            [dateB]
          ) =>
            dateA.localeCompare(
              dateB
            )
        )
        .slice(-7)
        .map(
          ([
            date,
            values,
          ]) => {
            const formattedDate =
              new Date(
                date
              ).toLocaleDateString(
                'en-US',
                {
                  month: 'short',
                  day: 'numeric',
                }
              );

            return {
              time:
                formattedDate,

              attendance:
                values.total === 0
                  ? 0
                  : Math.round(
                      (values.present /
                        values.total) *
                        100
                    ),
            };
          }
        );
    }, [
      attendanceRecords,
    ]);

  // =====================================================
  // RECENT ATTENDANCE
  // =====================================================

  const recentAttendance =
    useMemo(() => {
      return [
        ...attendanceRecords,
      ]
        .sort(
          (a, b) =>
            new Date(
              b.date
            ) -
            new Date(
              a.date
            )
        )
        .slice(0, 4)
        .map(
          (record) => {
            const student =
              students.find(
                (item) =>
                  item.id ===
                  record.student_id
              );

            const status =
              String(
                record.status || ''
              ).toLowerCase();

            const date =
              new Date(
                record.date
              );

            return {
              name:
                student?.name ||
                `Student ${record.student_id}`,

              status:
                status
                  .charAt(0)
                  .toUpperCase() +
                status.slice(1),

              time:
                date.toLocaleTimeString(
                  'en-US',
                  {
                    hour: 'numeric',
                    minute: '2-digit',
                  }
                ),

              statusClass:
                status ===
                'present'
                  ? 'text-emerald-400'
                  : status ===
                    'late'
                  ? 'text-amber-400'
                  : 'text-rose-400',

              dotClass:
                status ===
                'present'
                  ? 'bg-emerald-400'
                  : status ===
                    'late'
                  ? 'bg-amber-400'
                  : 'bg-rose-400',
            };
          }
        );
    }, [
      attendanceRecords,
      students,
    ]);

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const notifications =
    useMemo(() => {
      const result = [];

      // -----------------------------------------------
      // System
      // -----------------------------------------------

      result.push({
        id: 'system-operational',
        title:
          'Attendance system operational',
        message:
          'AttendSmart is ready for attendance monitoring.',
        time: 'System',
        type: 'system',
        icon: ShieldCheck,
        iconClass:
          'bg-emerald-500/10 text-emerald-400',
      });

      // -----------------------------------------------
      // Recent attendance
      // -----------------------------------------------

      if (
        attendanceRecords.length >
        0
      ) {
        const latestRecord =
          [
            ...attendanceRecords,
          ].sort(
            (a, b) =>
              new Date(b.date) -
              new Date(a.date)
          )[0];

        result.push({
          id: `attendance-${latestRecord.id}`,
          title:
            'New attendance activity',
          message:
            'A new attendance record has been recorded.',
          time: latestRecord.date
            ? new Date(
                latestRecord.date
              ).toLocaleTimeString(
                'en-US',
                {
                  hour: 'numeric',
                  minute: '2-digit',
                }
              )
            : 'Recently',
          type: 'attendance',
          icon: Activity,
          iconClass:
            'bg-blue-500/10 text-blue-400',
        });
      }

      // -----------------------------------------------
      // Admin low attendance
      // -----------------------------------------------

      if (
        userRole === 'admin'
      ) {
        const attendanceByStudent =
          {};

        attendanceRecords.forEach(
          (record) => {
            const studentId =
              record.student_id;

            if (
              !attendanceByStudent[
                studentId
              ]
            ) {
              attendanceByStudent[
                studentId
              ] = {
                total: 0,
                present: 0,
              };
            }

            attendanceByStudent[
              studentId
            ].total += 1;

            if (
              String(
                record.status
              ).toLowerCase() ===
              'present'
            ) {
              attendanceByStudent[
                studentId
              ].present += 1;
            }
          }
        );

        const atRiskCount =
          students.filter(
            (student) => {
              const attendance =
                attendanceByStudent[
                  student.id
                ];

              if (
                !attendance ||
                attendance.total ===
                  0
              ) {
                return false;
              }

              const percentage =
                (attendance.present /
                  attendance.total) *
                100;

              return (
                percentage < 75
              );
            }
          ).length;

        if (
          atRiskCount > 0
        ) {
          result.push({
            id:
              'at-risk-students',
            title:
              'Students need attention',
            message: `${atRiskCount} student${
              atRiskCount > 1
                ? 's are'
                : ' is'
            } below 75% attendance.`,
            time: 'Attention',
            type: 'warning',
            icon: UserRoundCheck,
            iconClass:
              'bg-amber-500/10 text-amber-400',
          });
        }
      }

      // -----------------------------------------------
      // Faculty
      // -----------------------------------------------

      if (
        userRole === 'faculty'
      ) {
        result.push({
          id:
            'faculty-workspace',
          title:
            'Attendance workspace ready',
          message:
            'You can start or review classroom attendance.',
          time: 'Ready',
          type: 'faculty',
          icon: CalendarCheck2,
          iconClass:
            'bg-cyan-500/10 text-cyan-400',
        });
      }

      // -----------------------------------------------
      // Student
      // -----------------------------------------------

      if (
        userRole === 'student'
      ) {
        result.push({
          id:
            'student-monitoring',
          title:
            'Attendance monitoring active',
          message:
            'Your attendance records are being monitored in real time.',
          time: 'Active',
          type: 'student',
          icon: ShieldCheck,
          iconClass:
            'bg-indigo-500/10 text-indigo-400',
        });
      }

      return result;
    }, [
      attendanceRecords,
      students,
      userRole,
    ]);

  // =====================================================
  // UNREAD NOTIFICATIONS
  // =====================================================

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !readNotifications.includes(
          notification.id
        )
    );

  // =====================================================
  // MARK ONE NOTIFICATION AS READ
  // =====================================================

  const markNotificationAsRead = (
    notificationId
  ) => {
    setReadNotifications(
      (current) => {
        if (
          current.includes(
            notificationId
          )
        ) {
          return current;
        }

        const updated = [
          ...current,
          notificationId,
        ];

        localStorage.setItem(
          'attendsmart_read_notifications',
          JSON.stringify(
            updated
          )
        );

        return updated;
      }
    );
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllNotificationsAsRead =
    () => {
      const allIds =
        notifications.map(
          (notification) =>
            notification.id
        );

      setReadNotifications(
        allIds
      );

      localStorage.setItem(
        'attendsmart_read_notifications',
        JSON.stringify(
          allIds
        )
      );
    };

  // =====================================================
  // CALENDAR
  // =====================================================

  const currentDate =
    new Date();

  const currentMonthLabel =
    currentDate.toLocaleDateString(
      'en-US',
      {
        month: 'long',
        year: 'numeric',
      }
    );

  const daysInMonth =
    new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() +
        1,
      0
    ).getDate();

  const firstDay =
    new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

  const mondayOffset =
    firstDay === 0
      ? 6
      : firstDay - 1;

  const attendanceCalendar =
    useMemo(() => {
      const result = {};

      attendanceRecords.forEach(
        (record) => {
          if (!record.date) {
            return;
          }

          const date =
            new Date(
              record.date
            );

          if (
            date.getMonth() !==
              currentDate.getMonth() ||
            date.getFullYear() !==
              currentDate.getFullYear()
          ) {
            return;
          }

          const day =
            date.getDate();

          if (!result[day]) {
            result[day] = {
              total: 0,
              present: 0,
            };
          }

          result[day].total +=
            1;

          if (
            String(
              record.status
            ).toLowerCase() ===
            'present'
          ) {
            result[day].present +=
              1;
          }
        }
      );

      return result;
    }, [
      attendanceRecords,
    ]);

  const getCalendarClass = (
    day
  ) => {
    const data =
      attendanceCalendar[
        day
      ];

    if (!data) {
      return 'text-gray-500 hover:bg-white/5';
    }

    const percentage =
      data.total === 0
        ? 0
        : (data.present /
            data.total) *
          100;

    if (
      percentage >= 75
    ) {
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
    }

    if (
      percentage >= 50
    ) {
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/20';
    }

    return 'bg-rose-500/15 text-rose-400 border border-rose-500/20';
  };

  // =====================================================
  // CARD STYLE
  // =====================================================

  const cardStyle =
    'relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#191d27]/90 backdrop-blur-xl shadow-[0_15px_50px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]';

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0f18] text-gray-200">

      {/* ==================================================
          BACKGROUND
      ================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -top-32 -left-32 h-96 w-96 animate-pulse rounded-full bg-blue-600/10 blur-3xl" />

        <div
          className="absolute top-1/3 -right-32 h-96 w-96 animate-pulse rounded-full bg-cyan-500/10 blur-3xl"
          style={{
            animationDelay:
              '1s',
          }}
        />

        <div
          className="absolute bottom-0 left-1/3 h-80 w-80 animate-pulse rounded-full bg-indigo-500/10 blur-3xl"
          style={{
            animationDelay:
              '2s',
          }}
        />

      </div>

      <DashboardLayout>

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="relative mb-8 flex flex-col gap-5 pt-2 xl:flex-row xl:items-center xl:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

              <span className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
                Live Monitoring
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">

              Automated Student Attendance

              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                & Analytics
              </span>

            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Real-time attendance intelligence
              for your institution
            </p>

          </div>

          <div className="flex items-center gap-3">

            {/* Search */}
            <div className="relative hidden lg:block">

              <Search
                className="absolute left-4 top-3.5 text-gray-500"
                size={18}
              />

              <input
                type="text"
                placeholder="Search students..."
                className="w-64 rounded-2xl border border-white/[0.06] bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-gray-300 outline-none transition-all placeholder:text-gray-600 focus:border-blue-500/40 focus:bg-white/[0.05]"
              />

            </div>

            {/* ============================================
                NOTIFICATION BELL
            ============================================ */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setIsNotificationsOpen(
                    (current) =>
                      !current
                  )
                }
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 transition-all hover:bg-white/[0.07]"
                aria-label="Notifications"
              >

                <Bell
                  size={19}
                  className={`transition-all ${
                    isNotificationsOpen
                      ? 'rotate-12 text-blue-400'
                      : 'text-gray-300 group-hover:rotate-12'
                  }`}
                />

                {unreadNotifications.length >
                  0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#0b0f18] bg-rose-500 px-1 text-[9px] font-bold text-white shadow-lg shadow-rose-900/30">
                    {unreadNotifications.length >
                    9
                      ? '9+'
                      : unreadNotifications.length}
                  </span>
                )}

              </button>

              {/* Notification dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-14 z-[100] w-[360px] overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#151a24] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] p-4">

                    <div>

                      <div className="flex items-center gap-2">

                        <Bell
                          size={17}
                          className="text-blue-400"
                        />

                        <h3 className="font-semibold text-white">
                          Notifications
                        </h3>

                      </div>

                      <p className="mt-1 text-[10px] text-gray-600">
                        {unreadNotifications.length >
                        0
                          ? `${unreadNotifications.length} unread`
                          : 'All caught up'}
                      </p>

                    </div>

                    <div className="flex items-center gap-1">

                      {unreadNotifications.length >
                        0 && (
                        <button
                          type="button"
                          onClick={
                            markAllNotificationsAsRead
                          }
                          className="rounded-lg p-2 text-gray-600 transition hover:bg-white/[0.05] hover:text-emerald-400"
                          title="Mark all as read"
                        >
                          <CheckCheck
                            size={16}
                          />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setIsNotificationsOpen(
                            false
                          )
                        }
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-white/[0.05] hover:text-white"
                        title="Close"
                      >
                        <X
                          size={16}
                        />
                      </button>

                    </div>

                  </div>

                  {/* Notification list */}
                  <div className="max-h-[420px] overflow-y-auto">

                    {notifications.length ===
                    0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">

                        <Bell
                          size={28}
                          className="mb-3 text-gray-700"
                        />

                        <p className="text-sm text-gray-500">
                          No notifications
                        </p>

                      </div>
                    ) : (
                      notifications.map(
                        (
                          notification
                        ) => {
                          const isUnread =
                            !readNotifications.includes(
                              notification.id
                            );

                          const Icon =
                            notification.icon;

                          return (
                            <button
                              key={
                                notification.id
                              }
                              type="button"
                              onClick={() =>
                                markNotificationAsRead(
                                  notification.id
                                )
                              }
                              className={`flex w-full gap-3 border-b border-white/[0.04] p-4 text-left transition-all hover:bg-white/[0.035] ${
                                isUnread
                                  ? 'bg-blue-500/[0.035]'
                                  : ''
                              }`}
                            >

                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notification.iconClass}`}
                              >
                                <Icon
                                  size={17}
                                />
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-2">

                                  <p
                                    className={`text-sm ${
                                      isUnread
                                        ? 'font-semibold text-white'
                                        : 'font-medium text-gray-400'
                                    }`}
                                  >
                                    {
                                      notification.title
                                    }
                                  </p>

                                  {isUnread && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                                  )}

                                </div>

                                <p className="mt-1 text-xs leading-5 text-gray-600">
                                  {
                                    notification.message
                                  }
                                </p>

                                <p className="mt-2 text-[10px] text-gray-700">
                                  {
                                    notification.time
                                  }
                                </p>

                              </div>

                            </button>
                          );
                        }
                      )
                    )}

                  </div>

                  {/* Footer */}
                  <div className="border-t border-white/[0.06] bg-white/[0.015] p-3">

                    <p className="text-center text-[10px] text-gray-700">
                      AttendSmart notification center
                    </p>

                  </div>

                </div>
              )}

            </div>

            {/* ============================================
                DYNAMIC USER PROFILE
            ============================================ */}

            <button
              type="button"
              onClick={
                goToSettings
              }
              className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.06]"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-900/30">
                {profileInitials}
              </div>

              <div className="hidden min-w-0 sm:block">

                <p className="max-w-[160px] truncate text-sm font-semibold text-white">
                  {profileName ||
                    'Loading...'}
                </p>

                <p className="text-[11px] capitalize text-gray-500">
                  {profileRoleLabel}
                </p>

              </div>

            </button>

          </div>

        </header>

        {/* ==================================================
            KPI CARDS
        ================================================== */}

        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* TOTAL STUDENTS */}
          <button
            type="button"
            onClick={
              goToStudents
            }
            className={`${cardStyle} w-full cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
          >

            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl" />

            <div className="relative p-6">

              <div className="mb-5 flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/20">

                  <Users
                    size={20}
                    className="text-blue-400"
                  />

                </div>

                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                  Open Students
                </span>

              </div>

              <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
                Total Students
              </p>

              <p className="mt-2 text-4xl font-bold tracking-tight text-white">
                {loading
                  ? '...'
                  : totalStudents}
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">

                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">

                  <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />

                </div>

                <span>
                  View
                </span>

              </div>

            </div>

          </button>

          {/* TODAY ATTENDANCE */}
          <div
            className={
              cardStyle
            }
          >

            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl" />

            <div className="relative p-6">

              <div className="mb-5 flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">

                  <TrendingUp
                    size={20}
                    className="text-emerald-400"
                  />

                </div>

                <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                  Live

                </span>

              </div>

              <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
                Today's Attendance
              </p>

              <p className="mt-2 text-4xl font-bold tracking-tight text-white">
                {loading
                  ? '...'
                  : `${todayAttendance}%`}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Present students today
              </p>

            </div>

          </div>

          {/* VERIFICATION */}
          <button
            type="button"
            onClick={
              goToAttendance
            }
            className={`${cardStyle} w-full cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
          >

            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl" />

            <div className="relative p-6">

              <div className="mb-5 flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20">

                  <ShieldCheck
                    size={20}
                    className="text-indigo-400"
                  />

                </div>

                <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                  Open Attendance
                </span>

              </div>

              <p className="text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
                Verification Status
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                Operational
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                Facial + Location checks active

              </div>

            </div>

          </button>

        </div>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <div className="relative mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">

          {/* LIVE ATTENDANCE */}
          <div
            className={`${cardStyle} xl:col-span-4`}
          >

            <div className="border-b border-white/[0.05] p-6">

              <div className="flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <Activity
                      size={18}
                      className="text-blue-400"
                    />

                    <h3 className="font-semibold text-white">
                      Live Attendance
                    </h3>

                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Latest recorded activity
                  </p>

                </div>

                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                  Live

                </span>

              </div>

            </div>

            <div className="p-4">

              {recentAttendance.length >
              0 ? (
                <div className="space-y-2">

                  {recentAttendance.map(
                    (
                      student,
                      index
                    ) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between rounded-2xl border border-white/[0.04] bg-white/[0.025] p-3 transition-all hover:bg-white/[0.05]"
                      >

                        <div className="flex items-center gap-3">

                          <div className="relative">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 text-xs font-bold text-white">

                              {student.name
                                .charAt(
                                  0
                                )
                                .toUpperCase()}

                            </div>

                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#191d27] ${student.dotClass}`}
                            />

                          </div>

                          <div>

                            <p className="text-sm font-semibold text-white">
                              {student.name}
                            </p>

                            <p className="mt-0.5 text-[11px] text-gray-600">
                              Attendance recorded
                            </p>

                          </div>

                        </div>

                        <div className="text-right">

                          <p
                            className={`text-xs font-bold ${student.statusClass}`}
                          >
                            {
                              student.status
                            }
                          </p>

                          <p className="mt-0.5 text-[10px] text-gray-600">
                            {student.time}
                          </p>

                        </div>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="flex min-h-[250px] flex-col items-center justify-center text-center">

                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">

                    <Activity
                      size={28}
                      className="text-gray-700"
                    />

                  </div>

                  <p className="text-sm font-medium text-gray-500">
                    No attendance activity yet
                  </p>

                  <p className="mt-1 text-xs text-gray-700">
                    New attendance records will appear here
                  </p>

                </div>
              )}

            </div>

          </div>

          {/* VERIFICATION ENGINE */}
          <div
            className={`${cardStyle} xl:col-span-4`}
          >

            <div className="border-b border-white/[0.05] p-6">

              <div className="flex items-center gap-2">

                <ShieldCheck
                  size={18}
                  className="text-indigo-400"
                />

                <h3 className="font-semibold text-white">
                  Verification Engine
                </h3>

              </div>

              <p className="mt-1 text-xs text-gray-500">
                Multi-factor attendance validation
              </p>

            </div>

            <div className="flex min-h-[330px] items-center justify-center p-6">

              <div className="relative w-full max-w-md">

                <div className="absolute left-1/2 top-1/2 hidden h-px w-[75%] -translate-x-1/2 bg-gradient-to-r from-blue-500/20 via-indigo-500/60 to-emerald-500/20 md:block" />

                <div className="relative z-10 flex flex-col items-center justify-between gap-4 md:flex-row">

                  <div className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-center transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.04] md:w-32">

                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">

                      <ScanFace
                        size={20}
                        className="text-blue-400"
                      />

                    </div>

                    <p className="text-xs font-semibold text-white">
                      Face Scan
                    </p>

                    <p className="mt-1 text-[10px] text-gray-600">
                      Identity match
                    </p>

                  </div>

                  <div className="relative w-full md:w-36">

                    <div className="absolute -inset-2 animate-pulse rounded-[24px] bg-indigo-500/10 blur-xl" />

                    <button
                      type="button"
                      onClick={
                        goToAttendance
                      }
                      className="relative w-full rounded-[22px] border border-indigo-400/30 bg-gradient-to-b from-indigo-600 to-blue-700 p-5 text-center shadow-2xl shadow-blue-900/30 transition-all hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                    >

                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">

                        <ShieldCheck
                          size={24}
                          className="text-white"
                        />

                      </div>

                      <p className="text-sm font-bold text-white">
                        Verification
                      </p>

                      <p className="mt-2 text-[10px] leading-5 text-blue-100">
                        Match Identity
                        <br />
                        Verify Location
                        <br />
                        Check Schedule
                      </p>

                    </button>

                  </div>

                  <div className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-center transition-all hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] md:w-32">

                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">

                      <MapPin
                        size={20}
                        className="text-emerald-400"
                      />

                    </div>

                    <p className="text-xs font-semibold text-white">
                      Geo Check
                    </p>

                    <p className="mt-1 text-[10px] text-gray-600">
                      Location verified
                    </p>

                  </div>

                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-400">

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                  Click to mark attendance

                </div>

              </div>

            </div>

          </div>

          {/* QUICK ACTIONS */}
          <div
            className={`${cardStyle} xl:col-span-4`}
          >

            <div className="border-b border-white/[0.05] p-6">

              <div className="flex items-center gap-2">

                <ArrowUpRight
                  size={18}
                  className="text-cyan-400"
                />

                <h3 className="font-semibold text-white">
                  Quick Actions
                </h3>

              </div>

              <p className="mt-1 text-xs text-gray-500">
                Frequently used administrative tools
              </p>

            </div>

            <div className="space-y-3 p-5">

              {/* Generate report */}
              <button
                type="button"
                onClick={
                  goToReports
                }
                className="group flex w-full items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-blue-500/20 hover:bg-blue-500/[0.05] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">

                    <FileText
                      size={18}
                      className="text-blue-400"
                    />

                  </div>

                  <div>

                    <p className="text-sm font-semibold text-white">
                      Generate Class Report
                    </p>

                    <p className="mt-0.5 text-[11px] text-gray-600">
                      Open report generation
                    </p>

                  </div>

                </div>

                <ArrowUpRight
                  size={16}
                  className="text-gray-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-400"
                />

              </button>

              {/* At Risk - admin only */}
              {userRole ===
                'admin' && (
                <button
                  type="button"
                  onClick={
                    goToAtRiskStudents
                  }
                  className="group flex w-full items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-amber-500/20 hover:bg-amber-500/[0.05] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">

                      <UserRoundCheck
                        size={18}
                        className="text-amber-400"
                      />

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-white">
                        At-Risk Students
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-600">
                        View students below 75%
                      </p>

                    </div>

                  </div>

                  <ArrowUpRight
                    size={16}
                    className="text-gray-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-amber-400"
                  />

                </button>
              )}

              {/* Attendance */}
              <button
                type="button"
                onClick={
                  goToAttendance
                }
                className="group flex w-full items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-500/20 hover:bg-cyan-500/[0.05] focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">

                    <CalendarCheck2
                      size={18}
                      className="text-cyan-400"
                    />

                  </div>

                  <div>

                    <p className="text-sm font-semibold text-white">
                      Classroom Schedule
                    </p>

                    <p className="mt-0.5 text-[11px] text-gray-600">
                      Open attendance workspace
                    </p>

                  </div>

                </div>

                <ArrowUpRight
                  size={16}
                  className="text-gray-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-400"
                />

              </button>

            </div>

          </div>

          {/* ==================================================
              CALENDAR
          ================================================== */}

          <div
            className={`${cardStyle} xl:col-span-4`}
          >

            <div className="border-b border-white/[0.05] p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs uppercase tracking-[0.18em] text-gray-600">
                    Attendance
                  </p>

                  <h3 className="mt-1 font-semibold text-white">
                    {currentMonthLabel}
                  </h3>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">

                  <CalendarCheck2
                    size={18}
                    className="text-cyan-400"
                  />

                </div>

              </div>

            </div>

            <div className="p-5">

              <div className="mb-4 grid grid-cols-7 text-center">

                {[
                  'M',
                  'T',
                  'W',
                  'T',
                  'F',
                  'S',
                  'S',
                ].map(
                  (
                    day,
                    index
                  ) => (
                    <span
                      key={index}
                      className="text-[10px] font-semibold uppercase tracking-widest text-gray-700"
                    >
                      {day}
                    </span>
                  )
                )}

              </div>

              <div className="grid grid-cols-7 gap-1.5">

                {Array.from(
                  {
                    length:
                      mondayOffset,
                  },
                  (_, index) => (
                    <div
                      key={`empty-${index}`}
                    />
                  )
                )}

                {Array.from(
                  {
                    length:
                      daysInMonth,
                  },
                  (_, index) => {
                    const day =
                      index + 1;

                    const isToday =
                      day ===
                      currentDate.getDate();

                    return (
                      <div
                        key={day}
                        className={`flex h-8 items-center justify-center rounded-xl border text-[11px] transition-all ${getCalendarClass(
                          day
                        )} ${
                          isToday
                            ? 'ring-2 ring-blue-500/50'
                            : 'border-transparent'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </div>

          {/* ==================================================
              ANALYTICS CHART
          ================================================== */}

          <div
            className={`${cardStyle} xl:col-span-8`}
          >

            <div className="border-b border-white/[0.05] p-6">

              <div className="flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <TrendingUp
                      size={18}
                      className="text-blue-400"
                    />

                    <h3 className="font-semibold text-white">
                      Attendance Analytics
                    </h3>

                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Seven-day attendance performance
                  </p>

                </div>

                <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400">

                  {chartData.length >
                  0
                    ? `${chartData[
                        chartData.length -
                          1
                      ].attendance}%`
                    : 'No Data'}

                </div>

              </div>

            </div>

            <div className="h-[340px] p-5">

              {chartData.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart
                    data={
                      chartData
                    }
                  >

                    <defs>

                      <linearGradient
                        id="attendanceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopColor="#3b82f6"
                          stopOpacity={
                            0.45
                          }
                        />

                        <stop
                          offset="100%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />

                      </linearGradient>

                    </defs>

                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#6b7280',
                        fontSize: 10,
                      }}
                      dy={10}
                    />

                    <YAxis
                      domain={[
                        0,
                        100,
                      ]}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#6b7280',
                        fontSize: 10,
                      }}
                      dx={-10}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          '#131721',
                        border:
                          '1px solid rgba(255,255,255,0.08)',
                        borderRadius:
                          '14px',
                        color: '#fff',
                        boxShadow:
                          '0 20px 40px rgba(0,0,0,0.35)',
                      }}
                      formatter={(
                        value
                      ) => [
                        `${value}%`,
                        'Attendance',
                      ]}
                    />

                    <Area
                      type="monotone"
                      dataKey="attendance"
                      stroke="#60a5fa"
                      strokeWidth={3}
                      fill="url(#attendanceGradient)"
                      animationDuration={
                        1200
                      }
                    />

                  </AreaChart>

                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">

                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03]">

                    <TrendingUp
                      size={24}
                      className="text-gray-700"
                    />

                  </div>

                  <p className="text-sm font-medium text-gray-500">
                    No attendance data available
                  </p>

                  <p className="mt-1 text-xs text-gray-700">
                    Start recording attendance to build the trend
                  </p>

                </div>
              )}

            </div>

          </div>

        </div>

      </DashboardLayout>

    </div>
  );
};

export default Dashboard;