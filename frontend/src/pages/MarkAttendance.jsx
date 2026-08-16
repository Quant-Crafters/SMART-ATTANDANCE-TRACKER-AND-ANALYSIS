import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import DashboardLayout from '../components/layout/DashboardLayout';

import {
  CheckCircle,
  UserCheck,
  BookOpen,
  CalendarDays,
  GraduationCap,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

const MarkAttendance = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const [currentRole, setCurrentRole] = useState('');
  const [currentFaculty, setCurrentFaculty] = useState(null);

  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [facultyId, setFacultyId] = useState('');

  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [status, setStatus] = useState('present');

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // --------------------------------------------------
  // GET CURRENT ROLE
  // --------------------------------------------------

  const getRole = () => {
    try {
      const savedUser = localStorage.getItem('user');

      if (savedUser) {
        const user = JSON.parse(savedUser);

        if (user?.role) {
          return String(user.role).toLowerCase();
        }
      }
    } catch (error) {
      console.error('Saved user read error:', error);
    }

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

      return String(payload.role || '').toLowerCase();
    } catch (error) {
      console.error('JWT role read error:', error);
      return '';
    }
  };

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        setPageLoading(true);
        setErrorMessage('');

        const role = getRole();

        setCurrentRole(role);

        if (role !== 'admin' && role !== 'faculty') {
          throw new Error(
            'You do not have permission to mark attendance.'
          );
        }

        // ----------------------------------------------
        // Students are available to both admin & faculty
        // ----------------------------------------------

        const studentsResponse =
          await apiClient.get('/students');

        const studentsData =
          studentsResponse.data?.data || [];

        setStudents(studentsData);

        // ==============================================
        // ADMIN
        // ==============================================

        if (role === 'admin') {
          const [
            subjectsResponse,
            facultyResponse,
          ] = await Promise.all([
            apiClient.get('/subjects/'),
            apiClient.get('/faculty/'),
          ]);

          setSubjects(
            subjectsResponse.data?.data || []
          );

          setFaculty(
            facultyResponse.data?.data || []
          );

          return;
        }

        // ==============================================
        // FACULTY
        // ==============================================

        if (role === 'faculty') {
          // Logged-in faculty profile
          const facultyResponse =
            await apiClient.get('/faculty/me');

          const facultyProfile =
            facultyResponse.data?.data;

          if (!facultyProfile) {
            throw new Error(
              'Faculty profile not found.'
            );
          }

          setCurrentFaculty(facultyProfile);

          // IMPORTANT:
          // The logged-in faculty is automatically selected.
          setFacultyId(
            String(facultyProfile.id)
          );

          // --------------------------------------------
          // ONLY ASSIGNED SUBJECTS
          // --------------------------------------------

          const assignmentsResponse =
            await apiClient.get(
              '/faculty-subjects/me'
            );

          const assignments =
            assignmentsResponse.data?.data || [];

          const assignedSubjects =
            assignments
              .map(
                (assignment) =>
                  assignment?.subject
              )
              .filter(Boolean);

          setSubjects(assignedSubjects);

          // If faculty has exactly one subject,
          // select it automatically.
          if (
            assignedSubjects.length === 1
          ) {
            setSubjectId(
              String(
                assignedSubjects[0].id
              )
            );
          }

          return;
        }
      } catch (error) {
        console.error(
          'Failed to load attendance data:',
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

        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            'Failed to load attendance data.'
        );
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, []);

  // --------------------------------------------------
  // SUBMIT ATTENDANCE
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (
      !studentId ||
      !subjectId ||
      !facultyId ||
      !date ||
      !status
    ) {
      setErrorMessage(
        'Please fill all required fields.'
      );
      return;
    }

    // --------------------------------------------------
    // EXTRA CLIENT-SIDE FACULTY SECURITY
    // --------------------------------------------------

    if (currentRole === 'faculty') {
      const assignedSubject =
        subjects.find(
          (subject) =>
            String(subject.id) ===
            String(subjectId)
        );

      if (!assignedSubject) {
        setErrorMessage(
          'You are not assigned to this subject.'
        );
        return;
      }

      if (
        currentFaculty &&
        String(facultyId) !==
          String(currentFaculty.id)
      ) {
        setErrorMessage(
          'You can only mark attendance as yourself.'
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      const attendanceData = {
        student_id: Number(studentId),
        subject_id: Number(subjectId),
        faculty_id: Number(facultyId),
        date: new Date(
          `${date}T00:00:00`
        ).toISOString(),
        status: status,
      };

      console.log(
        'ATTENDANCE REQUEST:',
        attendanceData
      );

      const response =
        await apiClient.post(
          '/attendance/',
          attendanceData
        );

      console.log(
        'ATTENDANCE RESPONSE:',
        response.data
      );

      setSuccessMessage(
        'Attendance marked successfully.'
      );

      setStudentId('');

      // Faculty keeps their assigned subject selected.
      // Admin resets it.
      if (currentRole === 'admin') {
        setSubjectId('');
        setFacultyId('');
      }

      setStatus('present');
    } catch (error) {
      console.error(
        'Attendance submission error:',
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

      setErrorMessage(
        error.response?.data?.message ||
          'Failed to mark attendance.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (pageLoading) {
    return (
      <div className="bg-[#11131a] min-h-screen text-gray-200">
        <DashboardLayout>

          <div className="flex items-center justify-center min-h-[60vh]">

            <div className="text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <BookOpen
                  size={24}
                  className="animate-pulse text-blue-500"
                />
              </div>

              <p className="text-gray-400">
                Loading attendance data...
              </p>

            </div>

          </div>

        </DashboardLayout>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="bg-[#11131a] min-h-screen text-gray-200">

      <DashboardLayout>

        {/* Header */}
        <header className="mb-8 pt-2">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
              <CheckCircle
                size={20}
                className="text-blue-500"
              />
            </div>

            <div>

              <h1 className="text-2xl font-semibold text-white">
                Mark Attendance
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Record attendance for a student
              </p>

            </div>

          </div>

        </header>

        {/* Form Container */}
        <div className="max-w-3xl">

          <div className="bg-[#1c202a] border border-gray-800/50 rounded-2xl shadow-sm p-6">

            {/* SUCCESS */}
            {successMessage && (
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-4 mb-6">

                <CheckCircle size={20} />

                <span className="text-sm">
                  {successMessage}
                </span>

              </div>
            )}

            {/* ERROR */}
            {errorMessage && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6">

                <AlertCircle
                  size={20}
                  className="mt-0.5"
                />

                <span className="text-sm">
                  {errorMessage}
                </span>

              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* Student */}
              <div>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">

                  <UserCheck
                    size={17}
                    className="text-blue-500"
                  />

                  Student

                </label>

                <select
                  value={studentId}
                  onChange={(e) =>
                    setStudentId(
                      e.target.value
                    )
                  }
                  required
                  className="w-full bg-[#11131a] text-gray-200 rounded-xl px-4 py-3 border border-gray-700/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >

                  <option value="">
                    Select student
                  </option>

                  {students.map(
                    (student) => (
                      <option
                        key={student.id}
                        value={student.id}
                      >
                        {student.student_id} —{' '}
                        {student.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* Subject */}
              <div>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">

                  <BookOpen
                    size={17}
                    className="text-blue-500"
                  />

                  Subject

                </label>

                <select
                  value={subjectId}
                  onChange={(e) =>
                    setSubjectId(
                      e.target.value
                    )
                  }
                  required
                  className="w-full bg-[#11131a] text-gray-200 rounded-xl px-4 py-3 border border-gray-700/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >

                  <option value="">
                    Select subject
                  </option>

                  {subjects.map(
                    (subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.code} —{' '}
                        {subject.name}
                      </option>
                    )
                  )}

                </select>

                {currentRole ===
                  'faculty' && (
                  <p className="mt-2 text-xs text-blue-400/80">
                    Only your assigned subjects are available.
                  </p>
                )}

              </div>

              {/* Faculty */}
              <div>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">

                  <GraduationCap
                    size={17}
                    className="text-blue-500"
                  />

                  Faculty

                </label>

                {currentRole ===
                'faculty' ? (
                  <div className="flex items-center gap-3 w-full bg-[#11131a] text-gray-200 rounded-xl px-4 py-3 border border-blue-500/20">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                      <ShieldCheck
                        size={17}
                        className="text-blue-400"
                      />
                    </div>

                    <div>

                      <p className="text-sm font-medium text-white">
                        {currentFaculty?.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {currentFaculty?.faculty_id}
                      </p>

                    </div>

                    <span className="ml-auto text-xs font-medium text-emerald-400">
                      You
                    </span>

                  </div>
                ) : (
                  <select
                    value={facultyId}
                    onChange={(e) =>
                      setFacultyId(
                        e.target.value
                      )
                    }
                    required
                    className="w-full bg-[#11131a] text-gray-200 rounded-xl px-4 py-3 border border-gray-700/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >

                    <option value="">
                      Select faculty
                    </option>

                    {faculty.map(
                      (member) => (
                        <option
                          key={member.id}
                          value={member.id}
                        >
                          {member.faculty_id} —{' '}
                          {member.name}
                        </option>
                      )
                    )}

                  </select>
                )}

              </div>

              {/* Date */}
              <div>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">

                  <CalendarDays
                    size={17}
                    className="text-blue-500"
                  />

                  Date

                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(
                      e.target.value
                    )
                  }
                  required
                  className="w-full bg-[#11131a] text-gray-200 rounded-xl px-4 py-3 border border-gray-700/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

              </div>

              {/* Status */}
              <div>

                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Attendance Status
                </label>

                <div className="grid grid-cols-3 gap-3">

                  {/* Present */}
                  <button
                    type="button"
                    onClick={() =>
                      setStatus(
                        'present'
                      )
                    }
                    className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${
                      status ===
                      'present'
                        ? 'bg-green-500/10 border-green-500 text-green-400'
                        : 'bg-[#11131a] border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    Present
                  </button>

                  {/* Absent */}
                  <button
                    type="button"
                    onClick={() =>
                      setStatus(
                        'absent'
                      )
                    }
                    className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${
                      status ===
                      'absent'
                        ? 'bg-red-500/10 border-red-500 text-red-400'
                        : 'bg-[#11131a] border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    Absent
                  </button>

                  {/* Late */}
                  <button
                    type="button"
                    onClick={() =>
                      setStatus('late')
                    }
                    className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${
                      status ===
                      'late'
                        ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400'
                        : 'bg-[#11131a] border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    Late
                  </button>

                </div>

              </div>

              {/* Summary */}
              <div className="bg-[#11131a] border border-gray-800 rounded-xl p-4">

                <p className="text-xs text-gray-500 mb-3">
                  Attendance Record
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">

                  <div>

                    <span className="text-gray-500">
                      Student:
                    </span>

                    <span className="text-gray-200 ml-2">

                      {studentId
                        ? students.find(
                            (student) =>
                              String(
                                student.id
                              ) ===
                              String(
                                studentId
                              )
                          )?.name ||
                          'Selected'
                        : 'Not selected'}

                    </span>

                  </div>

                  <div>

                    <span className="text-gray-500">
                      Subject:
                    </span>

                    <span className="text-gray-200 ml-2">

                      {subjectId
                        ? subjects.find(
                            (subject) =>
                              String(
                                subject.id
                              ) ===
                              String(
                                subjectId
                              )
                          )?.code ||
                          'Selected'
                        : 'Not selected'}

                    </span>

                  </div>

                  <div>

                    <span className="text-gray-500">
                      Faculty:
                    </span>

                    <span className="text-gray-200 ml-2">

                      {currentRole ===
                      'faculty'
                        ? currentFaculty?.name ||
                          'Current Faculty'
                        : facultyId
                        ? faculty.find(
                            (member) =>
                              String(
                                member.id
                              ) ===
                              String(
                                facultyId
                              )
                          )?.name ||
                          'Selected'
                        : 'Not selected'}

                    </span>

                  </div>

                  <div>

                    <span className="text-gray-500">
                      Status:
                    </span>

                    <span
                      className={`ml-2 font-semibold ${
                        status ===
                        'present'
                          ? 'text-green-400'
                          : status ===
                            'absent'
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {status
                        .charAt(0)
                        .toUpperCase() +
                        status.slice(1)}
                    </span>

                  </div>

                </div>

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  submitting
                }
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
              >

                <CheckCircle
                  size={19}
                />

                {submitting
                  ? 'Marking Attendance...'
                  : 'Mark Attendance'}

              </button>

            </form>

          </div>

        </div>

      </DashboardLayout>
    </div>
  );
};

export default MarkAttendance;