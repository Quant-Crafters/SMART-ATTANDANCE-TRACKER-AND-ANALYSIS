import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import apiClient from '../api/client';
import DashboardLayout from '../components/layout/DashboardLayout';

import {
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  GraduationCap,
  User,
  Briefcase,
  AlertTriangle,
  Users,
  ShieldCheck,
  CheckCircle,
  ChevronDown,
  Sparkles,
  Building2,
  Award,
  BookOpen,
  ArrowRight,
  BookMarked,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const Faculty = () => {
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState('');

  const [facultyList, setFacultyList] =
    useState([]);

  const [currentFaculty, setCurrentFaculty] =
    useState(null);

  const [mySubjects, setMySubjects] =
    useState([]);

  const [subjectsLoading, setSubjectsLoading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [subjectError, setSubjectError] =
    useState('');

  const [searchTerm, setSearchTerm] =
    useState('');

  const [showFilters, setShowFilters] =
    useState(false);

  const [departmentFilter, setDepartmentFilter] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('');

  // --------------------------------------------------
  // GET ROLE
  // --------------------------------------------------

  const getRole = () => {
    try {
      const savedUser =
        localStorage.getItem('user');

      if (savedUser) {
        const user =
          JSON.parse(savedUser);

        if (user?.role) {
          return String(
            user.role
          ).toLowerCase();
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
        'JWT role read error:',
        error
      );

      return '';
    }
  };

  // --------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------

  useEffect(() => {
    const fetchFacultyData =
      async () => {
        try {
          setLoading(true);
          setError('');

          const role =
            getRole();

          console.log(
            'FACULTY PAGE ROLE:',
            role
          );

          setUserRole(role);

          // ==========================================
          // FACULTY PERSONAL PROFILE
          // ==========================================

          if (role === 'faculty') {
            const response =
              await apiClient.get(
                '/faculty/me'
              );

            console.log(
              'MY FACULTY PROFILE:',
              response.data
            );

            const faculty =
              response.data?.data;

            if (!faculty) {
              throw new Error(
                'Faculty profile not found.'
              );
            }

            setCurrentFaculty(
              faculty
            );

            // ========================================
            // FACULTY ASSIGNED SUBJECTS
            // ========================================

            try {
              setSubjectsLoading(true);
              setSubjectError('');

              const subjectResponse =
                await apiClient.get(
                  '/faculty-subjects/me'
                );

              console.log(
                'MY SUBJECTS:',
                subjectResponse.data
              );

              setMySubjects(
                subjectResponse.data?.data ||
                  []
              );
            } catch (subjectErr) {
              console.error(
                'Faculty subjects error:',
                subjectErr
              );

              setSubjectError(
                subjectErr.response?.data?.message ||
                  'Unable to load assigned subjects.'
              );
            } finally {
              setSubjectsLoading(false);
            }

            return;
          }

          // ==========================================
          // ADMIN / STUDENT FACULTY DIRECTORY
          // ==========================================

          if (
            role === 'admin' ||
            role === 'student'
          ) {
            const response =
              await apiClient.get(
                '/faculty/'
              );

            console.log(
              'FACULTY RESPONSE:',
              response.data
            );

            setFacultyList(
              response.data?.data ||
                []
            );

            return;
          }

          throw new Error(
            'You do not have access to the Faculty section.'
          );
        } catch (err) {
          console.error(
            'Faculty page error:',
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
              'Failed to load faculty data.'
          );
        } finally {
          setLoading(false);
        }
      };

    fetchFacultyData();
  }, []);

  // --------------------------------------------------
  // DIRECTORY FILTERS
  // --------------------------------------------------

  const departments =
    useMemo(() => {
      return [
        ...new Set(
          facultyList
            .map(
              (faculty) =>
                faculty.department
            )
            .filter(Boolean)
        ),
      ];
    }, [facultyList]);

  const filteredFaculty =
    useMemo(() => {
      return facultyList.filter(
        (faculty) => {
          const name =
            faculty.name || '';

          const facultyId =
            faculty.faculty_id || '';

          const email =
            faculty.email || '';

          const search =
            searchTerm.toLowerCase();

          const matchesSearch =
            name
              .toLowerCase()
              .includes(search) ||
            facultyId
              .toLowerCase()
              .includes(search) ||
            email
              .toLowerCase()
              .includes(search);

          const matchesDepartment =
            !departmentFilter ||
            faculty.department ===
              departmentFilter;

          const matchesStatus =
            !statusFilter ||
            (statusFilter ===
              'active' &&
              faculty.status === true) ||
            (statusFilter ===
              'inactive' &&
              faculty.status === false);

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesStatus
          );
        }
      );
    }, [
      facultyList,
      searchTerm,
      departmentFilter,
      statusFilter,
    ]);

  const activeFacultyCount =
    facultyList.filter(
      (faculty) =>
        faculty.status
    ).length;

  const clearFilters = () => {
    setDepartmentFilter('');
    setStatusFilter('');
  };

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
                Loading faculty information...
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Preparing faculty data
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
                Unable to Load Faculty
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
  // FACULTY PERSONAL PROFILE
  // ==================================================

  if (userRole === 'faculty') {
    const initials =
      currentFaculty?.name
        ?.split(' ')
        .map(
          (part) =>
            part.charAt(0)
        )
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0b0f18] text-gray-200">

        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute -left-24 -top-24 h-80 w-80 animate-pulse rounded-full bg-blue-600/10 blur-3xl" />

          <div
            className="absolute right-0 top-1/3 h-96 w-96 animate-pulse rounded-full bg-indigo-500/10 blur-3xl"
            style={{
              animationDelay: '1s',
            }}
          />

          <div
            className="absolute bottom-0 left-1/3 h-72 w-72 animate-pulse rounded-full bg-cyan-500/10 blur-3xl"
            style={{
              animationDelay: '2s',
            }}
          />

        </div>

        <DashboardLayout>

          {/* =========================================
              HEADER
          ========================================= */}

          <header className="relative mb-8">

            <div className="mb-2 flex items-center gap-2">

              <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                Faculty Portal
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome, {currentFaculty?.name}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Your professional information,
              subjects and attendance workspace.
            </p>

          </header>

          {/* =========================================
              PROFILE + SUMMARY
          ========================================= */}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">

            {/* PROFILE */}
            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#191d27]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] xl:col-span-8">

              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

              <div className="relative">

                <div className="flex flex-col gap-5 border-b border-white/[0.05] pb-6 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-4">

                    <div className="relative">

                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 text-2xl font-bold text-white shadow-xl shadow-indigo-900/30">
                        {initials ||
                          currentFaculty?.name
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
                        {currentFaculty?.name}
                      </p>

                      <p className="mt-1 text-sm text-indigo-400">
                        {currentFaculty?.faculty_id}
                      </p>

                      <p className="mt-1 text-xs text-gray-600">
                        {currentFaculty?.designation ||
                          'Faculty Member'}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.05] px-3 py-2">

                    <ShieldCheck
                      size={15}
                      className="text-emerald-400"
                    />

                    <span className="text-xs font-semibold text-emerald-400">
                      Active Faculty
                    </span>

                  </div>

                </div>

                {/* DETAILS */}
                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">

                  {[
                    {
                      icon: Mail,
                      label: 'Email',
                      value:
                        currentFaculty?.email ||
                        'Not available',
                    },
                    {
                      icon: Phone,
                      label: 'Phone',
                      value:
                        currentFaculty?.phone ||
                        'Not available',
                    },
                    {
                      icon: GraduationCap,
                      label: 'Department',
                      value:
                        currentFaculty?.department ||
                        'Not assigned',
                    },
                    {
                      icon: Briefcase,
                      label: 'Designation',
                      value:
                        currentFaculty?.designation ||
                        'Not specified',
                    },
                    {
                      icon: User,
                      label: 'Faculty ID',
                      value:
                        currentFaculty?.faculty_id ||
                        'Not available',
                    },
                    {
                      icon: Building2,
                      label: 'Institutional Role',
                      value:
                        'Academic Faculty',
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

            {/* SUMMARY */}
            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#191d27]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] xl:col-span-4">

              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-600">
                      Faculty Overview
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-white">
                      Professional Snapshot
                    </h2>

                  </div>

                  <Award
                    size={20}
                    className="text-blue-400"
                  />

                </div>

                <div className="mt-6 space-y-3">

                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">

                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                      Department
                    </p>

                    <p className="mt-2 text-sm font-semibold text-white">
                      {currentFaculty?.department ||
                        'Not assigned'}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">

                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                      Designation
                    </p>

                    <p className="mt-2 text-sm font-semibold text-white">
                      {currentFaculty?.designation ||
                        'Not specified'}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">

                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                      Assigned Subjects
                    </p>

                    <p className="mt-2 text-2xl font-bold text-indigo-400">
                      {mySubjects.length}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">

                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                      Account Status
                    </p>

                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">

                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                      <span className="text-xs font-semibold text-emerald-400">
                        {currentFaculty?.status
                          ? 'Active'
                          : 'Inactive'}
                      </span>

                    </div>

                  </div>

                </div>

                <div className="mt-6 rounded-2xl border border-blue-500/10 bg-blue-500/[0.05] p-4">

                  <div className="flex gap-3">

                    <Sparkles
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-400"
                    />

                    <p className="text-xs leading-5 text-gray-500">
                      Your faculty profile is connected
                      to the AttendSmart academic system.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =========================================
              MY SUBJECTS
          ========================================= */}

          <section className="relative mt-6 overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#191d27]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">

            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-indigo-400" />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
                      Academic Assignment
                    </span>

                  </div>

                  <h2 className="mt-2 text-2xl font-bold text-white">
                    My Subjects
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    These are the subjects assigned to your faculty account.
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/10 bg-indigo-500/10">

                  <BookMarked
                    size={20}
                    className="text-indigo-400"
                  />

                </div>

              </div>

              {/* SUBJECT LOADING */}
              {subjectsLoading && (
                <div className="mt-6 flex items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.02] p-10">

                  <div className="text-center">

                    <BookOpen
                      size={25}
                      className="mx-auto animate-pulse text-indigo-400"
                    />

                    <p className="mt-3 text-sm text-gray-400">
                      Loading your subjects...
                    </p>

                  </div>

                </div>
              )}

              {/* SUBJECT ERROR */}
              {!subjectsLoading &&
                subjectError && (
                  <div className="mt-6 rounded-2xl border border-red-500/10 bg-red-500/[0.05] p-5">

                    <div className="flex items-start gap-3">

                      <AlertTriangle
                        size={18}
                        className="mt-0.5 shrink-0 text-red-400"
                      />

                      <div>

                        <p className="text-sm font-semibold text-red-300">
                          Unable to load subjects
                        </p>

                        <p className="mt-1 text-xs text-red-400/70">
                          {subjectError}
                        </p>

                      </div>

                    </div>

                  </div>
                )}

              {/* NO SUBJECTS */}
              {!subjectsLoading &&
                !subjectError &&
                mySubjects.length === 0 && (
                  <div className="mt-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-10 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03]">

                      <GraduationCap
                        size={26}
                        className="text-gray-700"
                      />

                    </div>

                    <p className="mt-4 text-sm font-semibold text-gray-400">
                      No subjects assigned yet
                    </p>

                    <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-gray-600">
                      Your administrator has not assigned
                      any subjects to your faculty account yet.
                    </p>

                  </div>
                )}

              {/* SUBJECT CARDS */}
              {!subjectsLoading &&
                !subjectError &&
                mySubjects.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                    {mySubjects.map(
                      (assignment) => {
                        const subject =
                          assignment?.subject;

                        const subjectId =
                          subject?.id ||
                          assignment?.subject_id;

                        return (
                          <div
                            key={
                              assignment.id ||
                              subjectId
                            }
                            className="group relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/20 hover:bg-white/[0.04]"
                          >

                            {/* Card glow */}
                            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl transition-opacity group-hover:opacity-100" />

                            <div className="relative">

                              <div className="flex items-start justify-between gap-4">

                                <div className="flex min-w-0 items-start gap-3">

                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">

                                    <BookOpen
                                      size={19}
                                      className="text-indigo-400"
                                    />

                                  </div>

                                  <div className="min-w-0">

                                    <h3 className="truncate text-base font-semibold text-white">
                                      {subject?.name ||
                                        'Unknown Subject'}
                                    </h3>

                                    <p className="mt-1 text-xs font-medium text-indigo-400">
                                      {subject?.code ||
                                        'No subject code'}
                                    </p>

                                  </div>

                                </div>

                                <span className="shrink-0 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-emerald-400">
                                  Assigned
                                </span>

                              </div>

                              <div className="mt-5 grid grid-cols-2 gap-2">

                                <div className="rounded-xl border border-white/[0.05] bg-black/10 p-3">

                                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-600">
                                    Semester
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-gray-300">
                                    {subject?.semester ??
                                      '-'}
                                  </p>

                                </div>

                                <div className="rounded-xl border border-white/[0.05] bg-black/10 p-3">

                                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-600">
                                    Credits
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-gray-300">
                                    {subject?.credits ??
                                      0}
                                  </p>

                                </div>

                              </div>

                              <div className="mt-3 rounded-xl border border-white/[0.05] bg-black/10 px-3 py-2.5">

                                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-600">
                                  Department ID
                                </p>

                                <p className="mt-1 text-xs font-semibold text-gray-400">
                                  {subject?.department_id ??
                                    '-'}
                                </p>

                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  if (!subjectId) {
                                    return;
                                  }

                                  navigate(
                                    `/attendance?subject_id=${subjectId}`
                                  );
                                }}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500/10 px-4 py-3 text-xs font-semibold text-indigo-400 transition-all hover:bg-indigo-500/20 hover:text-indigo-300"
                              >

                                <span>
                                  Mark Attendance
                                </span>

                                <ArrowRight
                                  size={14}
                                  className="transition-transform group-hover:translate-x-0.5"
                                />

                              </button>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

            </div>

          </section>

        </DashboardLayout>

      </div>
    );
  }

  // ==================================================
  // ADMIN / STUDENT FACULTY DIRECTORY
  // ==================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0f18] text-gray-200">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-24 -top-24 h-80 w-80 animate-pulse rounded-full bg-blue-600/10 blur-3xl" />

        <div
          className="absolute right-0 top-1/3 h-96 w-96 animate-pulse rounded-full bg-indigo-500/10 blur-3xl"
          style={{
            animationDelay: '1s',
          }}
        />

      </div>

      <DashboardLayout>

        {/* Header */}
        <header className="relative mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-indigo-400" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                Faculty Directory
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Faculty Directory
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              View faculty members, departments and professional information
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
                placeholder="Search faculty..."
                className="w-72 rounded-2xl border border-white/[0.06] bg-[#191d27] py-3 pl-10 pr-4 text-sm text-gray-300 outline-none transition-all placeholder:text-gray-600 focus:border-indigo-500/30"
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
                    ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
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
                <div className="absolute right-0 top-14 z-50 w-72 rounded-[22px] border border-white/[0.08] bg-[#171b25] p-5 shadow-2xl">

                  <div className="mb-5 flex items-center justify-between">

                    <h3 className="font-semibold text-white">
                      Filter Faculty
                    </h3>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-medium text-blue-400 hover:text-blue-300"
                    >
                      Clear All
                    </button>

                  </div>

                  {/* Department */}
                  <div className="mb-4">

                    <label className="mb-2 block text-xs font-medium text-gray-500">
                      Department
                    </label>

                    <select
                      value={departmentFilter}
                      onChange={(e) =>
                        setDepartmentFilter(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-white/[0.06] bg-[#0e121a] px-3 py-2.5 text-sm text-gray-300 outline-none focus:border-indigo-500/30"
                    >

                      <option value="">
                        All Departments
                      </option>

                      {departments.map(
                        (department) => (
                          <option
                            key={department}
                            value={department}
                          >
                            {department}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* Status */}
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
                      className="w-full rounded-xl border border-white/[0.06] bg-[#0e121a] px-3 py-2.5 text-sm text-gray-300 outline-none focus:border-indigo-500/30"
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

        {/* Stats */}
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Total */}
          <div className="relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#191d27] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12]">

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />

            <div className="relative flex items-center justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                  Total Faculty
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {facultyList.length}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">

                <Users
                  size={19}
                  className="text-blue-400"
                />

              </div>

            </div>

          </div>

          {/* Active */}
          <div className="relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#191d27] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/20">

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />

            <div className="relative flex items-center justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                  Active Faculty
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-400">
                  {activeFacultyCount}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">

                <CheckCircle
                  size={19}
                  className="text-emerald-400"
                />

              </div>

            </div>

          </div>

          {/* Departments */}
          <div className="relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#191d27] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/20">

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />

            <div className="relative flex items-center justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                  Departments
                </p>

                <p className="mt-2 text-3xl font-bold text-indigo-400">
                  {departments.length}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">

                <Building2
                  size={19}
                  className="text-indigo-400"
                />

              </div>

            </div>

          </div>

        </div>

        {/* Result count */}
        <div className="mb-4 flex items-center justify-between">

          <p className="text-xs text-gray-600">

            Showing{' '}

            <span className="font-semibold text-gray-400">
              {filteredFaculty.length}
            </span>

            {' '}of{' '}

            <span className="font-semibold text-gray-400">
              {facultyList.length}
            </span>

            {' '}faculty members

          </p>

        </div>

        {/* Directory */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#191d27] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b border-white/[0.05] bg-white/[0.02] text-[10px] uppercase tracking-[0.15em] text-gray-600">

                  <th className="px-6 py-5">
                    Faculty
                  </th>

                  <th className="px-6 py-5">
                    Contact
                  </th>

                  <th className="px-6 py-5">
                    Department
                  </th>

                  <th className="px-6 py-5">
                    Designation
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

                {filteredFaculty.map(
                  (faculty) => (
                    <tr
                      key={faculty.faculty_id}
                      className="group border-b border-white/[0.04] transition-all hover:bg-white/[0.025]"
                    >

                      {/* Faculty */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="relative">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-sm font-bold text-white shadow-lg shadow-indigo-900/20">

                              {faculty.name
                                ?.charAt(0)
                                .toUpperCase()}

                            </div>

                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#191d27] ${
                                faculty.status
                                  ? 'bg-emerald-400'
                                  : 'bg-gray-600'
                              }`}
                            />

                          </div>

                          <div>

                            <p className="font-semibold text-white">
                              {faculty.name}
                            </p>

                            <p className="mt-1 text-xs text-indigo-400">
                              {faculty.faculty_id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Contact */}
                      <td className="px-6 py-5">

                        <p className="text-sm text-gray-300">
                          {faculty.email}
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                          {faculty.phone ||
                            'No phone'}
                        </p>

                      </td>

                      {/* Department */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <GraduationCap
                            size={16}
                            className="text-blue-400"
                          />

                          <span className="text-sm text-gray-300">
                            {faculty.department ||
                              'Not assigned'}
                          </span>

                        </div>

                      </td>

                      {/* Designation */}
                      <td className="px-6 py-5">

                        <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-1.5 text-xs font-medium text-gray-400">

                          <Briefcase
                            size={13}
                          />

                          {faculty.designation ||
                            'Not specified'}

                        </span>

                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                            faculty.status
                              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                              : 'border-red-500/20 bg-red-500/10 text-red-400'
                          }`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              faculty.status
                                ? 'bg-emerald-400'
                                : 'bg-red-400'
                            }`}
                          />

                          {faculty.status
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
                  )
                )}

              </tbody>

            </table>

          </div>

          {filteredFaculty.length ===
            0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">

                <Users
                  size={28}
                  className="text-gray-700"
                />

              </div>

              <p className="text-sm font-medium text-gray-500">
                No faculty found
              </p>

              <p className="mt-1 text-xs text-gray-700">
                Try changing your search or filters
              </p>

            </div>
          )}

        </div>

      </DashboardLayout>

    </div>
  );
};

export default Faculty;