import { useEffect, useMemo, useState } from "react";
import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
} from "../api/student.api";

const emptyForm = {
  student_id: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  semester: "",
  section: "",
  year: "",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getStudents();

      setStudents(response?.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const departments = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => student.department)
          .filter(Boolean)
      ),
    ];
  }, [students]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        student.name?.toLowerCase().includes(query) ||
        student.student_id?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query);

      const matchesDepartment =
        departmentFilter === "all" ||
        student.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [students, search, departmentFilter]);

  const openAddModal = () => {
    setEditingStudent(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);

    setForm({
      student_id: student.student_id || "",
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      department: student.department || "",
      semester: student.semester || "",
      section: student.section || "",
      year: student.year || "",
    });

    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingStudent(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSubmitting(true);

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          department: form.department,
          semester: Number(form.semester),
          section: form.section,
          year: Number(form.year),
          status: editingStudent.status,
        });
      } else {
        await createStudent({
          student_id: form.student_id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          department: form.department,
          semester: Number(form.semester),
          section: form.section,
          year: Number(form.year),
        });
      }

      closeModal();
      await loadStudents();
    } catch (err) {
      console.error(err);

      setFormError(
        err.response?.data?.message ||
          "Failed to save student."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteStudent(student.id);

      await loadStudents();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to delete student."
      );
    }
  };

  return (
    <div className="min-h-full bg-[#0b0d12] text-white">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Students
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage student records and academic information
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          + Add Student
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* FILTER BAR */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#11141b] p-4 md:flex-row">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, student ID or email..."
              className="w-full rounded-xl border border-white/10 bg-[#181c24] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(event) =>
              setDepartmentFilter(event.target.value)
            }
            className="rounded-xl border border-white/10 bg-[#181c24] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="all">All Departments</option>

            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#11141b]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-white/10 bg-[#151922]">
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4 font-medium">
                    Student
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Student ID
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Department
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Semester
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Section
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-16 text-center text-sm text-slate-500"
                    >
                      Loading students...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto max-w-md">
                        <div className="mb-3 text-4xl">
                          👨‍🎓
                        </div>

                        <h3 className="text-base font-medium text-white">
                          No students found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {students.length === 0
                            ? "There are currently no students in the database."
                            : "Try changing your search or department filter."}
                        </p>

                        {students.length === 0 && (
                          <button
                            type="button"
                            onClick={openAddModal}
                            className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                          >
                            Add First Student
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {student.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {student.email}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {student.student_id}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {student.department}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {student.semester}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {student.section}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            student.status
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {student.status
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(student)
                            }
                            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(student)
                            }
                            className="rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          {!loading && (
            <div className="border-t border-white/10 px-5 py-4 text-sm text-slate-500">
              Showing {filteredStudents.length} of{" "}
              {students.length} students
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#11141b] shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingStudent
                    ? "Edit Student"
                    : "Add Student"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingStudent
                    ? "Update student information"
                    : "Add a new student to AttendSmart"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-xl text-slate-500 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* MODAL FORM */}
            <form onSubmit={handleSubmit} className="p-6">
              {formError && (
                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {formError}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                {/* STUDENT ID */}
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Student ID
                  </label>

                  <input
                    name="student_id"
                    value={form.student_id}
                    onChange={handleChange}
                    disabled={!!editingStudent}
                    required
                    placeholder="e.g. CSE2026001"
                    className="w-full rounded-xl border border-white/10 bg-[#181c24] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* NAME */}
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Full Name
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Student name"
                    className="w-full rounded-xl border border-white/10 bg-[#181c24] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="student@example.com"
                    className="w-full rounded-xl border border-white/10 bg-[#181c24] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="w-full rounded-xl border border-white/10 bg-[#181c24] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                {/* DEPARTMENT */}
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Department
                  </label>

                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Computer Science"
                    className="w-full rounded-xl border border-white/10 bg-[#181c24] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                {/* SEMESTER */}
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Semester
                  </label>

                  <select
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#181c24] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="">Select semester</option>

                    {[1, 2, 3, 4, 5, 6, 7, 8].map(
                      (semester) => (
                        <option
                          key={semester}
                          value={semester}
                        >
                          Semester {semester}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* SECTION */}
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Section
                  </label>

                  <input
                    name="section"
                    value={form.section}
                    onChange={handleChange}
                    required
                    placeholder="e.g. A"
                    className="w-full rounded-xl border border-white/10 bg-[#181c24] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                {/* YEAR */}
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Year
                  </label>

                  <select
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#181c24] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="">Select year</option>

                    {[1, 2, 3, 4].map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-7 flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingStudent
                    ? "Update Student"
                    : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}