import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import DashboardLayout from '../components/layout/DashboardLayout';

import {
  Search,
  Filter,
  MoreVertical,
  User,
  Mail,
  Phone,
  GraduationCap,
  CalendarDays,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const Students = () => {
  const [searchParams] = useSearchParams();

  const lowAttendanceFilter =
    searchParams.get('attendance') === 'low';

  const [userRole, setUserRole] = useState('');
  const [currentStudent, setCurrentStudent] =
    useState(null);

  const [studentsList, setStudentsList] =
    useState([]);

  const [attendanceHistory, setAttendanceHistory] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search
  const [searchTerm, setSearchTerm] =
    useState('');

  // Filters
  const [showFilters, setShowFilters] =
    useState(false);

  const [departmentFilter, setDepartmentFilter] =
    useState('');

  const [semesterFilter, setSemesterFilter] =
    useState('');

  const [yearFilter, setYearFilter] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('');

  // Student attendance
  const [studentAttendance, setStudentAttendance] =
    useState(0);

  // --------------------------------------------------
  // ROLE
  // --------------------------------------------------

  const getRole = () => {
    try {
      const savedUser =
        localStorage.getItem('user');

      if (savedUser) {
        const user =
          JSON.parse(savedUser);

        if (user?.role) {
          return String(user.role)
            .toLowerCase();
        }
      }
    } catch (error) {
      console.error(
        'Saved user read error:',
        error
      );
    }

    try {
      const token =
        localStorage.getItem('token');

      if (!token) return '';

      const parts = token.split('.');

      if (parts.length !== 3) return '';

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

  // --------------------------------------------------
  // FETCH
  // --------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const role = getRole();

        console.log(
          'STUDENTS PAGE ROLE:',
          role
        );

        setUserRole(role);

        // ============================================
        // STUDENT
        // ============================================

        if (role === 'student') {
          const profileResponse =
            await apiClient.get(
              '/students/me'
            );

          const student =
            profileResponse.data?.data;

          if (!student) {
            throw new Error(
              'Student profile not found.'
            );
          }

          setCurrentStudent(student);

          // Attendance percentage
          try {
            const percentageResponse =
              await apiClient.get(
                `/attendance/percentage/${student.id}`
              );

            setStudentAttendance(
              Number(
                percentageResponse.data?.data
                  ?.attendance_percent || 0
              )
            );
          } catch (attendanceError) {
            console.error(
              'Student attendance percentage error:',
              attendanceError
            );

            setStudentAttendance(0);
          }

          // Attendance history
          try {
            const historyResponse =
              await apiClient.get(
                `/attendance/history/${student.id}`
              );

            setAttendanceHistory(
              historyResponse.data?.data || []
            );
          } catch (historyError) {
            console.error(
              'Student attendance history error:',
              historyError
            );

            setAttendanceHistory([]);
          }

          return;
        }

        // ============================================
        // ADMIN / FACULTY
        // ============================================

        if (
          role === 'admin' ||
          role === 'faculty'
        ) {
          const response =
            await apiClient.get(
              '/students'
            );

          const students =
            response.data?.data || [];

          const studentsWithAttendance =
            await Promise.all(
              students.map(
                async (student) => {
                  try {
                    const response =
                      await apiClient.get(
                        `/attendance/percentage/${student.id}`
                      );

                    return {
                      ...student,
                      attendance:
                        Number(
                          response.data?.data
                            ?.attendance_percent ||
                            0
                        ),
                    };
                  } catch (attendanceError) {
                    console.error(
                      `Attendance error for ${student.student_id}:`,
                      attendanceError
                    );

                    return {
                      ...student,
                      attendance: 0,
                    };
                  }
                }
              )
            );

          setStudentsList(
            studentsWithAttendance
          );

          return;
        }

        throw new Error(
          'Unable to determine your account role.'
        );
      } catch (err) {
        console.error(
          'Students page error:',
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

        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load student data.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --------------------------------------------------
  // ADMIN/FACULTY FILTER
  // --------------------------------------------------

  const filteredStudents =
    studentsList.filter((student) => {
      const name =
        student.name || '';

      const studentId =
        student.student_id || '';

      const matchesSearch =
        name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        studentId
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesDepartment =
        !departmentFilter ||
        student.department ===
          departmentFilter;

      const matchesSemester =
        !semesterFilter ||
        String(student.semester) ===
          String(semesterFilter);

      const matchesYear =
        !yearFilter ||
        String(student.year) ===
          String(yearFilter);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'active' &&
          student.status === true) ||
        (statusFilter === 'inactive' &&
          student.status === false);

      const matchesAttendance =
        !lowAttendanceFilter ||
        Number(student.attendance || 0) <
          75;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesSemester &&
        matchesYear &&
        matchesStatus &&
        matchesAttendance
      );
    });

  // --------------------------------------------------
  // FILTER OPTIONS
  // --------------------------------------------------

  const departments = useMemo(() => {
    return [
      ...new Set(
        studentsList
          .map(
            (student) =>
              student.department
          )
          .filter(Boolean)
      ),
    ];
  }, [studentsList]);

  const semesters = useMemo(() => {
    return [
      ...new Set(
        studentsList
          .map(
            (student) =>
              student.semester
          )
          .filter(
            (semester) =>
              semester !== null &&
              semester !== undefined
          )
      ),
    ].sort((a, b) => a - b);
  }, [studentsList]);

  const years = useMemo(() => {
    return [
      ...new Set(
        studentsList
          .map(
            (student) =>
              student.year
          )
          .filter(
            (year) =>
              year !== null &&
              year !== undefined
          )
      ),
    ].sort((a, b) => a - b);
  }, [studentsList]);

  const clearFilters = () => {
    setDepartmentFilter('');
    setSemesterFilter('');
    setYearFilter('');
    setStatusFilter('');
  };

  // --------------------------------------------------
  // STUDENT STATISTICS
  // --------------------------------------------------

  const totalClasses =
    attendanceHistory.length;

  const presentClasses =
    attendanceHistory.filter(
      (record) =>
        String(
          record.status || ''
        ).toLowerCase() ===
        'present'
    ).length;

  const absentClasses =
    attendanceHistory.filter(
      (record) =>
        String(
          record.status || ''
        ).toLowerCase() ===
        'absent'
    ).length;

  const lateClasses =
    attendanceHistory.filter(
      (record) =>
        String(
          record.status || ''
        ).toLowerCase() ===
        'late'
    ).length;

  const isLowAttendance =
    Number(studentAttendance) <
    75;

  const attendanceDegrees =
    Math.min(
      Number(studentAttendance) || 0,
      100
    ) * 3.6;

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f18] text-gray-200">
        <DashboardLayout>

          <div className="flex min-h-[70vh] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">

                <Users
                  size={28}
                  className="animate-pulse text-blue-400"
                />

              </div>

              <p className="font-medium text-gray-300">
                Loading student directory...
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Preparing your student data
              </p>

            </div>

          </div>

        </DashboardLayout>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0f18] text-gray-200">
        <DashboardLayout>

          <div className="mx-auto mt-12 max-w-xl">

            <div className="rounded-[28px] border border-red-500/20 bg-[#191d27] p-8 text-center shadow-2xl">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">

                <AlertTriangle
                  size={30}
                  className="text-red-400"
                />

              </div>

              <h2 className="text-xl font-semibold text-white">
                Unable to Load Students
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                {error}
              </p>

            </div>

          </div>

        </DashboardLayout>
      </div>
    );
  }

  // ==================================================
  // STUDENT PERSONAL VIEW
  // ==================================================

  if (userRole === 'student') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0b0f18] text-gray-200">

        {/* Animated background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute -left-28 -top-28 h-80 w-80 animate-pulse rounded-full bg-blue-600/10 blur-3xl" />

          <div
            className="absolute -right-28 top-1/3 h-96 w-96 animate-pulse rounded-full bg-cyan-500/10 blur-3xl"
            style={{
              animationDelay: '1s',
            }}
          />

          <div
            className="absolute bottom-0 left-1/3 h-72 w-72 animate-pulse rounded-full bg-indigo-500/10 blur-3xl"
            style={{
              animationDelay: '2s',
            }}
          />

        </div>

        <DashboardLayout>

          {/* Header */}
          <header className="relative mb-8">

            <div className="mb-2 flex items-center gap-2">

              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                Personal Portal
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              My Student Profile
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Your academic identity and attendance overview
            </p>

          </header>

          {/* Main Profile */}
          <div className="relative grid grid-cols-1 gap-5 xl:grid-cols-12">

            {/* Profile Card */}
            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#191d27]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] xl:col-span-8">

              {/* Glow */}
              <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative">

                {/* Profile Header */}
                <div className="flex flex-col gap-5 border-b border-white/[0.05] pb-6 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-4">

                    <div className="relative">

                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-xl shadow-blue-900/30">

                        {currentStudent?.name
                          ?.charAt(0)
                          .toUpperCase()}

                      </div>

                      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-[#191d27] bg-emerald-400">
                        <CheckCircle
                          size={12}
                          className="text-[#0b0f18]"
                        />
                      </span>

                    </div>

                    <div>

                      <p className="text-2xl font-bold text-white">
                        {currentStudent?.name}
                      </p>

                      <p className="mt-1 text-sm text-blue-400">
                        {currentStudent?.student_id}
                      </p>

                      <p className="mt-1 text-xs text-gray-600">
                        {currentStudent?.department}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.05] px-3 py-2">

                    <ShieldCheck
                      size={15}
                      className="text-emerald-400"
                    />

                    <span className="text-xs font-semibold text-emerald-400">
                      Active Student
                    </span>

                  </div>

                </div>

                {/* Information Cards */}
                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">

                  {[
                    {
                      icon: Mail,
                      label: 'Email',
                      value:
                        currentStudent?.email ||
                        'Not available',
                    },
                    {
                      icon: Phone,
                      label: 'Phone',
                      value:
                        currentStudent?.phone ||
                        'Not available',
                    },
                    {
                      icon: GraduationCap,
                      label: 'Department',
                      value:
                        currentStudent?.department ||
                        'Not available',
                    },
                    {
                      icon: BookOpen,
                      label: 'Semester',
                      value:
                        currentStudent?.semester
                          ? `Semester ${currentStudent.semester}`
                          : 'Not available',
                    },
                    {
                      icon: CalendarDays,
                      label: 'Year',
                      value:
                        currentStudent?.year
                          ? `Year ${currentStudent.year}`
                          : 'Not available',
                    },
                    {
                      icon: User,
                      label: 'Section',
                      value:
                        currentStudent?.section ||
                        'Not available',
                    },
                  ].map(
                    ({
                      icon: Icon,
                      label,
                      value,
                    }) => (
                      <div
                        key={label}
                        className="group rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4 transition-all hover:-translate-y-0.5 hover:border-white/[0.1] hover:bg-white/[0.04]"
                      >

                        <div className="mb-2 flex items-center gap-2 text-gray-600">

                          <Icon size={15} />

                          <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">
                            {label}
                          </span>

                        </div>

                        <p className="break-all text-sm font-medium text-gray-200">
                          {value}
                        </p>

                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

            {/* Attendance Card */}
            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#191d27]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] xl:col-span-4">

              <div
                className={`absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl ${
                  isLowAttendance
                    ? 'bg-red-500/10'
                    : 'bg-emerald-500/10'
                }`}
              />

              <div className="relative">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-600">
                      Attendance
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-white">
                      Overall Status
                    </h2>

                  </div>

                  {isLowAttendance ? (
                    <AlertTriangle
                      size={20}
                      className="text-red-400"
                    />
                  ) : (
                    <TrendingUp
                      size={20}
                      className="text-emerald-400"
                    />
                  )}

                </div>

                {/* Circular Meter */}
                <div className="relative mx-auto my-8 h-52 w-52">

                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(
                        ${
                          isLowAttendance
                            ? '#ef4444'
                            : '#10b981'
                        } ${attendanceDegrees}deg,
                        rgba(255,255,255,0.05) ${attendanceDegrees}deg
                      )`,
                    }}
                  />

                  <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-[#11141d] shadow-inner">

                    <p
                      className={`text-5xl font-bold ${
                        isLowAttendance
                          ? 'text-red-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {Number(
                        studentAttendance
                      ).toFixed(1)}
                      %
                    </p>

                    <p className="mt-2 text-xs text-gray-600">
                      Overall Attendance
                    </p>

                  </div>

                </div>

                {isLowAttendance ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4">

                    <div className="flex items-start gap-3">

                      <AlertTriangle
                        size={18}
                        className="mt-0.5 shrink-0 text-red-400"
                      />

                      <div>

                        <p className="text-sm font-semibold text-red-400">
                          Attendance Risk
                        </p>

                        <p className="mt-1 text-xs leading-5 text-red-400/70">
                          Your attendance is below
                          the required 75% threshold.
                        </p>

                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">

                    <div className="flex items-start gap-3">

                      <CheckCircle
                        size={18}
                        className="mt-0.5 shrink-0 text-emerald-400"
                      />

                      <div>

                        <p className="text-sm font-semibold text-emerald-400">
                          Attendance Healthy
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-400/70">
                          Your current attendance is
                          above the required threshold.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* Statistics */}
          <div className="relative mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">

            {[
              {
                label: 'Total Classes',
                value: totalClasses,
                icon: BookOpen,
                style:
                  'bg-blue-500/10 text-blue-400',
              },
              {
                label: 'Present',
                value: presentClasses,
                icon: CheckCircle,
                style:
                  'bg-emerald-500/10 text-emerald-400',
              },
              {
                label: 'Absent',
                value: absentClasses,
                icon: XCircle,
                style:
                  'bg-red-500/10 text-red-400',
              },
              {
                label: 'Late',
                value: lateClasses,
                icon: Clock,
                style:
                  'bg-amber-500/10 text-amber-400',
              },
            ].map(
              ({
                label,
                value,
                icon: Icon,
                style,
              }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/[0.06] bg-[#191d27] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12]"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                        {label}
                      </p>

                      <p className="mt-2 text-3xl font-bold text-white">
                        {value}
                      </p>

                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${style}`}
                    >
                      <Icon size={19} />
                    </div>

                  </div>

                </div>
              )
            )}

          </div>

          {/* Attendance History */}
          <div className="relative mt-5 overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#191d27] shadow-[0_15px_50px_rgba(0,0,0,0.2)]">

            <div className="border-b border-white/[0.05] p-6">

              <div className="flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <CalendarDays
                      size={18}
                      className="text-blue-400"
                    />

                    <h3 className="font-semibold text-white">
                      Attendance History
                    </h3>

                  </div>

                  <p className="mt-1 text-xs text-gray-600">
                    Your recent attendance records
                  </p>

                </div>

                <Sparkles
                  size={18}
                  className="text-indigo-400"
                />

              </div>

            </div>

            {attendanceHistory.length > 0 ? (

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead>

                    <tr className="border-b border-white/[0.05] bg-white/[0.02] text-[10px] uppercase tracking-[0.15em] text-gray-600">

                      <th className="px-6 py-4">
                        Date
                      </th>

                      <th className="px-6 py-4">
                        Subject
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {attendanceHistory.map(
                      (record) => {
                        const status =
                          String(
                            record.status ||
                              ''
                          ).toLowerCase();

                        const date =
                          record.date
                            ? new Date(
                                record.date
                              ).toLocaleDateString(
                                'en-US',
                                {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                }
                              )
                            : '—';

                        return (
                          <tr
                            key={record.id}
                            className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.025]"
                          >

                            <td className="px-6 py-4 text-sm text-gray-300">
                              {date}
                            </td>

                            <td className="px-6 py-4">

                              <span className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400">
                                <BookOpen
                                  size={13}
                                />
                                Subject #{record.subject_id}
                              </span>

                            </td>

                            <td className="px-6 py-4">

                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                                  status ===
                                  'present'
                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                    : status ===
                                      'late'
                                    ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                                    : 'border-red-500/20 bg-red-500/10 text-red-400'
                                }`}
                              >

                                {status ===
                                  'present' && (
                                  <CheckCircle
                                    size={
                                      13
                                    }
                                  />
                                )}

                                {status ===
                                  'absent' && (
                                  <XCircle
                                    size={
                                      13
                                    }
                                  />
                                )}

                                {status ===
                                  'late' && (
                                  <Clock
                                    size={
                                      13
                                    }
                                  />
                                )}

                                {record.status}

                              </span>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="flex flex-col items-center justify-center py-16 text-center">

                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">

                  <CalendarDays
                    size={28}
                    className="text-gray-700"
                  />

                </div>

                <p className="text-sm font-medium text-gray-500">
                  No attendance records yet
                </p>

                <p className="mt-1 text-xs text-gray-700">
                  Your attendance history will appear here
                </p>

              </div>

            )}

          </div>

        </DashboardLayout>
      </div>
    );
  }

  // ==================================================
  // ADMIN / FACULTY DIRECTORY VIEW
  // ==================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0f18] text-gray-200">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-20 -top-20 h-72 w-72 animate-pulse rounded-full bg-blue-600/10 blur-3xl" />

        <div
          className="absolute right-0 top-1/3 h-80 w-80 animate-pulse rounded-full bg-indigo-600/10 blur-3xl"
          style={{
            animationDelay: '1s',
          }}
        />

      </div>

      <DashboardLayout>

        {/* Header */}
        <header className="relative mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

          <div>

            {lowAttendanceFilter && (
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">

                <AlertTriangle size={14} />

                Low Attendance Students

              </div>
            )}

            <div className="mb-2 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-blue-400" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                Student Directory
              </span>

            </div>

            <h1 className="text-3xl font-bold text-white">
              {lowAttendanceFilter
                ? 'At-Risk Students'
                : 'Student Directory'}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {userRole === 'admin'
                ? 'Complete student management and attendance overview'
                : 'Student academic and attendance directory'}
            </p>

          </div>

          <div className="flex items-center gap-3">

            {/* Search */}
            <div className="relative">

              <Search
                size={17}
                className="absolute left-4 top-3.5 text-gray-600"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                placeholder="Search student..."
                className="w-64 rounded-2xl border border-white/[0.06] bg-[#191d27] py-3 pl-10 pr-4 text-sm text-gray-300 outline-none transition-all placeholder:text-gray-600 focus:border-blue-500/30"
              />

            </div>

            {/* Filter */}
            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    (value) => !value
                  )
                }
                className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
                  showFilters
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                    : 'border-white/[0.06] bg-[#191d27] text-gray-300 hover:bg-white/[0.04]'
                }`}
              >

                <Filter size={16} />

                Filter

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    showFilters
                      ? 'rotate-180'
                      : ''
                  }`}
                />

              </button>

              {showFilters && (
                <div className="absolute right-0 top-14 z-50 w-80 rounded-[22px] border border-white/[0.08] bg-[#171b25] p-5 shadow-2xl">

                  <div className="mb-5 flex items-center justify-between">

                    <h3 className="font-semibold text-white">
                      Filter Students
                    </h3>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-medium text-blue-400 hover:text-blue-300"
                    >
                      Clear All
                    </button>

                  </div>

                  {[
                    {
                      label: 'Department',
                      value:
                        departmentFilter,
                      setter:
                        setDepartmentFilter,
                      options:
                        departments,
                      allLabel:
                        'All Departments',
                      format: (value) =>
                        value,
                    },
                    {
                      label: 'Semester',
                      value:
                        semesterFilter,
                      setter:
                        setSemesterFilter,
                      options:
                        semesters,
                      allLabel:
                        'All Semesters',
                      format: (value) =>
                        `Semester ${value}`,
                    },
                    {
                      label: 'Year',
                      value:
                        yearFilter,
                      setter:
                        setYearFilter,
                      options: years,
                      allLabel:
                        'All Years',
                      format: (value) =>
                        `Year ${value}`,
                    },
                  ].map(
                    ({
                      label,
                      value,
                      setter,
                      options,
                      allLabel,
                      format,
                    }) => (
                      <div
                        key={label}
                        className="mb-4"
                      >

                        <label className="mb-2 block text-xs font-medium text-gray-500">
                          {label}
                        </label>

                        <select
                          value={value}
                          onChange={(e) =>
                            setter(
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-white/[0.06] bg-[#0e121a] px-3 py-2.5 text-sm text-gray-300 outline-none focus:border-blue-500/30"
                        >

                          <option value="">
                            {allLabel}
                          </option>

                          {options.map(
                            (option) => (
                              <option
                                key={option}
                                value={option}
                              >
                                {format(
                                  option
                                )}
                              </option>
                            )
                          )}

                        </select>

                      </div>
                    )
                  )}

                  <div>

                    <label className="mb-2 block text-xs font-medium text-gray-500">
                      Status
                    </label>

                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-white/[0.06] bg-[#0e121a] px-3 py-2.5 text-sm text-gray-300 outline-none focus:border-blue-500/30"
                    >

                      <option value="">
                        All Status
                      </option>

                      <option value="active">
                        Active
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>

                    </select>

                  </div>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* Result summary */}
        <div className="mb-4 flex items-center justify-between">

          <p className="text-xs text-gray-600">
            Showing{' '}
            <span className="font-semibold text-gray-400">
              {filteredStudents.length}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-400">
              {studentsList.length}
            </span>{' '}
            students
          </p>

          {lowAttendanceFilter && (
            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
              Below 75%
            </span>
          )}

        </div>

        {/* Table */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#191d27] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b border-white/[0.05] bg-white/[0.02] text-[10px] uppercase tracking-[0.15em] text-gray-600">

                  <th className="px-6 py-5">
                    Student
                  </th>

                  <th className="px-6 py-5">
                    Contact
                  </th>

                  <th className="px-6 py-5">
                    Academic
                  </th>

                  <th className="px-6 py-5">
                    Attendance
                  </th>

                  <th className="px-6 py-5">
                    Status
                  </th>

                  <th className="px-6 py-5 text-right">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredStudents.map(
                  (student) => {

                    const attendance =
                      Number(
                        student.attendance ||
                          0
                      );

                    const low =
                      attendance < 75;

                    return (
                      <tr
                        key={
                          student.student_id
                        }
                        className="group border-b border-white/[0.04] transition-all hover:bg-white/[0.025]"
                      >

                        {/* Student */}
                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="relative">

                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 text-sm font-bold text-white">
                                {student.name
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span
                                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#191d27] ${
                                  student.status
                                    ? 'bg-emerald-400'
                                    : 'bg-gray-600'
                                }`}
                              />

                            </div>

                            <div>

                              <p className="font-semibold text-white">
                                {student.name}
                              </p>

                              <p className="mt-1 text-xs text-gray-600">
                                {student.student_id}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Contact */}
                        <td className="px-6 py-5">

                          <p className="text-sm text-gray-300">
                            {student.email ||
                              'No email'}
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            {student.phone ||
                              'No phone'}
                          </p>

                        </td>

                        {/* Academic */}
                        <td className="px-6 py-5">

                          <p className="text-sm font-medium text-gray-300">
                            {student.department}
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            Semester{' '}
                            {
                              student.semester
                            }
                            {' • '}
                            Year{' '}
                            {student.year}

                            {student.section
                              ? ` • Section ${student.section}`
                              : ''}
                          </p>

                        </td>

                        {/* Attendance */}
                        <td className="px-6 py-5">

                          <div className="min-w-[120px]">

                            <div className="mb-2 flex items-center justify-between">

                              <span
                                className={`text-sm font-bold ${
                                  low
                                    ? 'text-red-400'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {attendance.toFixed(
                                  1
                                )}
                                %
                              </span>

                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">

                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  low
                                    ? 'bg-red-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    attendance,
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                              student.status
                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                : 'border-red-500/20 bg-red-500/10 text-red-400'
                            }`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                student.status
                                  ? 'bg-emerald-400'
                                  : 'bg-red-400'
                              }`}
                            />

                            {student.status
                              ? 'Active'
                              : 'Inactive'}

                          </span>

                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 text-right">

                          <button
                            type="button"
                            className="rounded-xl p-2 text-gray-600 transition hover:bg-white/[0.05] hover:text-white"
                          >
                            <MoreVertical
                              size={18}
                            />
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

          {filteredStudents.length ===
            0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">

                <Users
                  size={28}
                  className="text-gray-700"
                />

              </div>

              <p className="text-sm font-medium text-gray-500">
                No students found
              </p>

              <p className="mt-1 text-xs text-gray-700">
                Try changing your filters or search term
              </p>

            </div>
          )}

        </div>

      </DashboardLayout>
    </div>
  );
};

export default Students;