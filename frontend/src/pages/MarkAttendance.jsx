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
} from 'lucide-react';

const MarkAttendance = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);

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
  // LOAD STUDENTS, SUBJECTS AND FACULTY
  // --------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        setPageLoading(true);
        setErrorMessage('');

        const [
          studentsResponse,
          subjectsResponse,
          facultyResponse,
        ] = await Promise.all([
          apiClient.get('/students'),
          apiClient.get('/subjects/'),
          apiClient.get('/faculty/'),
        ]);

        console.log(
          'MARK ATTENDANCE - STUDENTS:',
          studentsResponse.data
        );

        console.log(
          'MARK ATTENDANCE - SUBJECTS:',
          subjectsResponse.data
        );

        console.log(
          'MARK ATTENDANCE - FACULTY:',
          facultyResponse.data
        );

        setStudents(
          studentsResponse.data.data || []
        );

        setSubjects(
          subjectsResponse.data.data || []
        );

        setFaculty(
          facultyResponse.data.data || []
        );
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
            'Failed to load students, subjects or faculty.'
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

      const response = await apiClient.post(
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

      // Reset selections after successful submission
      setStudentId('');
      setSubjectId('');
      setFacultyId('');
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
            <p className="text-gray-500">
              Loading attendance data...
            </p>
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

          <h1 className="text-2xl font-semibold text-white">
            Mark Attendance
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Record attendance for a student
          </p>

        </header>

        {/* Form Container */}
        <div className="max-w-3xl">

          <div className="bg-[#1c202a] border border-gray-800/50 rounded-2xl shadow-sm p-6">

            {/* Success */}
            {successMessage && (
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-4 mb-6">

                <CheckCircle size={20} />

                <span className="text-sm">
                  {successMessage}
                </span>

              </div>
            )}

            {/* Error */}
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
                    setStudentId(e.target.value)
                  }
                  required
                  className="w-full bg-[#11131a] text-gray-200 rounded-xl px-4 py-3 border border-gray-700/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >

                  <option value="">
                    Select student
                  </option>

                  {students.map((student) => (
                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.student_id} —{' '}
                      {student.name}
                    </option>
                  ))}

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
                    setSubjectId(e.target.value)
                  }
                  required
                  className="w-full bg-[#11131a] text-gray-200 rounded-xl px-4 py-3 border border-gray-700/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >

                  <option value="">
                    Select subject
                  </option>

                  {subjects.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.code} —{' '}
                      {subject.name}
                    </option>
                  ))}

                </select>

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

                <select
                  value={facultyId}
                  onChange={(e) =>
                    setFacultyId(e.target.value)
                  }
                  required
                  className="w-full bg-[#11131a] text-gray-200 rounded-xl px-4 py-3 border border-gray-700/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >

                  <option value="">
                    Select faculty
                  </option>

                  {faculty.map((member) => (
                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {member.faculty_id} —{' '}
                      {member.name}
                    </option>
                  ))}

                </select>

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
                    setDate(e.target.value)
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
                      setStatus('present')
                    }
                    className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${
                      status === 'present'
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
                      setStatus('absent')
                    }
                    className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${
                      status === 'absent'
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
                      status === 'late'
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
                              String(studentId)
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
                              String(subjectId)
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
                      {facultyId
                        ? faculty.find(
                            (member) =>
                              String(
                                member.id
                              ) ===
                              String(facultyId)
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
                        status === 'present'
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
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
              >

                <CheckCircle size={19} />

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