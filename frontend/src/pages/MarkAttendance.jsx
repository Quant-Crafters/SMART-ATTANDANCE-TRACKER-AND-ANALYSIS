import { useEffect, useMemo, useState } from "react";

const API_BASE = "/api";

export default function MarkAttendance() {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [attendance, setAttendance] = useState({});

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // ------------------------------------------------------------
  // Fetch students, faculty and subjects
  // ------------------------------------------------------------

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [studentsResponse, facultyResponse, subjectsResponse] =
          await Promise.all([
            fetch(`${API_BASE}/students`, {
              headers: authHeaders,
            }),

            fetch(`${API_BASE}/faculty/`, {
              headers: authHeaders,
            }),

            fetch(`${API_BASE}/subjects/`, {
              headers: authHeaders,
            }),
          ]);

        const studentsPayload = await studentsResponse.json();
        const facultyPayload = await facultyResponse.json();
        const subjectsPayload = await subjectsResponse.json();

        if (!studentsResponse.ok) {
          throw new Error(
            studentsPayload?.message || "Failed to fetch students."
          );
        }

        if (!facultyResponse.ok) {
          throw new Error(
            facultyPayload?.message || "Failed to fetch faculty."
          );
        }

        if (!subjectsResponse.ok) {
          throw new Error(
            subjectsPayload?.message || "Failed to fetch subjects."
          );
        }

        const studentsData =
          studentsPayload?.data ?? studentsPayload ?? [];

        const facultyData =
          facultyPayload?.data ?? facultyPayload ?? [];

        const subjectsData =
          subjectsPayload?.data ?? subjectsPayload ?? [];

        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setFaculty(Array.isArray(facultyData) ? facultyData : []);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);

        // Initialize every student as not marked.
        const initialAttendance = {};

        (Array.isArray(studentsData) ? studentsData : []).forEach(
          (student) => {
            initialAttendance[student.id] = "";
          }
        );

        setAttendance(initialAttendance);
      } catch (err) {
        console.error("Failed to load attendance data:", err);
        setError(
          err.message ||
            "Failed to load students, faculty and subjects."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ------------------------------------------------------------
  // Filter students
  // ------------------------------------------------------------

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter((student) => {
      return (
        student.name?.toLowerCase().includes(query) ||
        student.student_id?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query)
      );
    });
  }, [students, search]);

  // ------------------------------------------------------------
  // Change attendance status
  // ------------------------------------------------------------

  const updateAttendance = (studentId, status) => {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: status,
    }));

    setSuccess("");
    setError("");
  };

  // ------------------------------------------------------------
  // Mark all students
  // ------------------------------------------------------------

  const markAll = (status) => {
    const updated = {};

    students.forEach((student) => {
      updated[student.id] = status;
    });

    setAttendance(updated);

    setSuccess("");
    setError("");
  };

  // ------------------------------------------------------------
  // Submit attendance
  // ------------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedSubject) {
      setError("Please select a subject.");
      return;
    }

    if (!selectedFaculty) {
      setError("Please select a faculty member.");
      return;
    }

    if (!attendanceDate) {
      setError("Please select an attendance date.");
      return;
    }

    if (students.length === 0) {
      setError("There are no students available.");
      return;
    }

    const unmarkedStudents = students.filter(
      (student) => !attendance[student.id]
    );

    if (unmarkedStudents.length > 0) {
      setError(
        `Please mark attendance for all students. ${unmarkedStudents.length} student(s) are still unmarked.`
      );
      return;
    }

    setSubmitting(true);

    try {
      /*
       * The backend accepts ONE attendance record per POST.
       * Therefore we submit one request for each student.
       */

      const requests = students.map((student) => {
        const payload = {
          student_id: Number(student.id),
          subject_id: Number(selectedSubject),
          faculty_id: Number(selectedFaculty),
          date: `${attendanceDate}T00:00:00Z`,
          status: attendance[student.id],
        };

        return fetch(`${API_BASE}/attendance/`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(payload),
        }).then(async (response) => {
          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                `Failed to mark attendance for ${student.name}.`
            );
          }

          return data;
        });
      });

      await Promise.all(requests);

      setSuccess(
        `Attendance successfully marked for ${students.length} student(s).`
      );
    } catch (err) {
      console.error("Attendance submission failed:", err);

      setError(
        err.message ||
          "Failed to submit attendance. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // Loading state
  // ------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0d12] text-white flex items-center justify-center">
        <div className="text-slate-400">
          Loading attendance data...
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Main UI
  // ------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Mark Attendance
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Record student attendance for a class
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {success}
          </div>
        )}

        {/* CONTROLS */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-[#2a2e38] bg-[#11141b] p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* SUBJECT */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Subject
                </label>

                <select
                  value={selectedSubject}
                  onChange={(event) =>
                    setSelectedSubject(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#303541] bg-[#191d25] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select subject
                  </option>

                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>

                {subjects.length === 0 && (
                  <p className="mt-2 text-xs text-amber-400">
                    No subjects are currently available in the database.
                  </p>
                )}
              </div>

              {/* FACULTY */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Faculty
                </label>

                <select
                  value={selectedFaculty}
                  onChange={(event) =>
                    setSelectedFaculty(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#303541] bg-[#191d25] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select faculty
                  </option>

                  {faculty.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}{" "}
                      {member.faculty_id
                        ? `(${member.faculty_id})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* DATE */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Date
                </label>

                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(event) =>
                    setAttendanceDate(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#303541] bg-[#191d25] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* STUDENT LIST */}
          <div className="rounded-2xl border border-[#2a2e38] bg-[#11141b] overflow-hidden">
            {/* TABLE HEADER */}
            <div className="p-5 border-b border-[#2a2e38]">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Student Attendance
                  </h2>

                  <p className="text-sm text-slate-400 mt-1">
                    Mark each student as present, absent or late.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* SEARCH */}
                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search student..."
                    className="w-full sm:w-64 rounded-xl border border-[#303541] bg-[#191d25] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                  />

                  {/* BULK ACTIONS */}
                  <button
                    type="button"
                    onClick={() => markAll("present")}
                    className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/20 transition"
                  >
                    All Present
                  </button>

                  <button
                    type="button"
                    onClick={() => markAll("absent")}
                    className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition"
                  >
                    All Absent
                  </button>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2e38] text-left">
                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Student
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Student ID
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Department
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Attendance
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-5 py-16 text-center"
                      >
                        <div className="text-4xl mb-3">
                          🎓
                        </div>

                        <p className="text-white font-medium">
                          No students found
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          Try changing your search.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const status =
                        attendance[student.id] || "";

                      return (
                        <tr
                          key={student.id}
                          className="border-b border-[#20242d] last:border-b-0 hover:bg-[#151922] transition"
                        >
                          {/* STUDENT */}
                          <td className="px-5 py-4">
                            <div className="font-medium text-white">
                              {student.name}
                            </div>

                            <div className="text-xs text-slate-500 mt-1">
                              {student.email}
                            </div>
                          </td>

                          {/* ID */}
                          <td className="px-5 py-4 text-sm text-slate-300">
                            {student.student_id}
                          </td>

                          {/* DEPARTMENT */}
                          <td className="px-5 py-4 text-sm text-slate-300">
                            {student.department || "—"}
                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateAttendance(
                                    student.id,
                                    "present"
                                  )
                                }
                                className={`rounded-lg px-3 py-2 text-xs font-medium border transition ${
                                  status === "present"
                                    ? "bg-emerald-500 text-white border-emerald-500"
                                    : "bg-transparent text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                }`}
                              >
                                Present
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  updateAttendance(
                                    student.id,
                                    "late"
                                  )
                                }
                                className={`rounded-lg px-3 py-2 text-xs font-medium border transition ${
                                  status === "late"
                                    ? "bg-amber-500 text-white border-amber-500"
                                    : "bg-transparent text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                                }`}
                              >
                                Late
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  updateAttendance(
                                    student.id,
                                    "absent"
                                  )
                                }
                                className={`rounded-lg px-3 py-2 text-xs font-medium border transition ${
                                  status === "absent"
                                    ? "bg-red-500 text-white border-red-500"
                                    : "bg-transparent text-red-400 border-red-500/30 hover:bg-red-500/10"
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="px-5 py-4 border-t border-[#2a2e38] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-slate-500">
                Showing {filteredStudents.length} of{" "}
                {students.length} students
              </div>

              <button
                type="submit"
                disabled={
                  submitting ||
                  students.length === 0 ||
                  subjects.length === 0
                }
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition"
              >
                {submitting
                  ? "Saving Attendance..."
                  : "Save Attendance"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}