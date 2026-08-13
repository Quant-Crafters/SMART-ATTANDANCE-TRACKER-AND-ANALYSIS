import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  Mail,
  Phone,
  Building2,
  BriefcaseBusiness,
} from "lucide-react";

import {
  getFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} from "../api/faculty.api";

const emptyForm = {
  faculty_id: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
};

export default function Faculty() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");

  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  /* --------------------------------
     FETCH FACULTY
  -------------------------------- */

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getFaculties();

      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setFaculties(data);
    } catch (err) {
      console.error("Failed to fetch faculty:", err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch faculty members."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  /* --------------------------------
     DEPARTMENTS
  -------------------------------- */

  const departments = useMemo(() => {
    const values = faculties
      .map((faculty) => faculty.department)
      .filter(Boolean);

    return ["All Departments", ...new Set(values)];
  }, [faculties]);

  /* --------------------------------
     FILTER FACULTY
  -------------------------------- */

  const filteredFaculties = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faculties.filter((faculty) => {
      const matchesSearch =
        !query ||
        faculty.name?.toLowerCase().includes(query) ||
        faculty.faculty_id?.toLowerCase().includes(query) ||
        faculty.email?.toLowerCase().includes(query) ||
        faculty.department?.toLowerCase().includes(query) ||
        faculty.designation?.toLowerCase().includes(query);

      const matchesDepartment =
        departmentFilter === "All Departments" ||
        faculty.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [faculties, search, departmentFilter]);

  /* --------------------------------
     FORM HANDLING
  -------------------------------- */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingFaculty(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (faculty) => {
    setEditingFaculty(faculty);

    setForm({
      faculty_id: faculty.faculty_id || "",
      name: faculty.name || "",
      email: faculty.email || "",
      phone: faculty.phone || "",
      department: faculty.department || "",
      designation: faculty.designation || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingFaculty(null);
    setForm(emptyForm);
  };

  /* --------------------------------
     CREATE / UPDATE
  -------------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      if (editingFaculty) {
        const response = await updateFaculty(
          editingFaculty.id,
          {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            department: form.department.trim(),
            designation: form.designation.trim(),
          }
        );

        const updatedFaculty = response?.data;

        if (updatedFaculty) {
          setFaculties((previous) =>
            previous.map((faculty) =>
              faculty.id === editingFaculty.id
                ? updatedFaculty
                : faculty
            )
          );
        } else {
          await fetchFaculties();
        }

        setSuccess("Faculty updated successfully.");
      } else {
        const response = await createFaculty({
          faculty_id: form.faculty_id.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          department: form.department.trim(),
          designation: form.designation.trim(),
        });

        const newFaculty = response?.data;

        if (newFaculty) {
          setFaculties((previous) => [
            ...previous,
            newFaculty,
          ]);
        } else {
          await fetchFaculties();
        }

        setSuccess("Faculty added successfully.");
      }

      setShowModal(false);
      setEditingFaculty(null);
      setForm(emptyForm);
    } catch (err) {
      console.error("Faculty save error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save faculty member."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------------------------
     DELETE
  -------------------------------- */

  const handleDelete = async (faculty) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${faculty.name}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteFaculty(faculty.id);

      setFaculties((previous) =>
        previous.filter(
          (item) => item.id !== faculty.id
        )
      );

      setSuccess("Faculty deleted successfully.");
    } catch (err) {
      console.error("Faculty delete error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete faculty member."
      );
    }
  };

  /* --------------------------------
     UI
  -------------------------------- */

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white">

      {/* PAGE HEADER */}

      <div className="border-b border-white/10 px-6 py-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Faculty
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage faculty records and academic information
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Add Faculty
          </button>

        </div>
      </div>

      {/* CONTENT */}

      <div className="p-6 lg:p-8">

        {/* SUCCESS */}

        {success && (
          <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="text-red-400 transition hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* SEARCH / FILTER */}

        <div className="rounded-2xl border border-white/10 bg-[#11141b] p-4">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, faculty ID, email..."
                className="w-full rounded-xl border border-white/10 bg-[#191c24] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/50"
              />

            </div>

            <select
              value={departmentFilter}
              onChange={(event) =>
                setDepartmentFilter(event.target.value)
              }
              className="rounded-xl border border-white/10 bg-[#191c24] px-4 py-3 text-sm text-gray-300 outline-none focus:border-blue-500/50"
            >
              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                  className="bg-[#11141b]"
                >
                  {department}
                </option>
              ))}
            </select>

          </div>

        </div>

        {/* FACULTY TABLE */}

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#11141b]">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Faculty
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Faculty ID
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Department
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Designation
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-16 text-center text-sm text-gray-500"
                    >
                      Loading faculty...
                    </td>
                  </tr>
                ) : filteredFaculties.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-20 text-center"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                        <Users className="h-7 w-7" />
                      </div>

                      <h3 className="mt-4 text-base font-semibold text-white">
                        No faculty found
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {faculties.length === 0
                          ? "There are currently no faculty members in the database."
                          : "Try changing your search or department filter."}
                      </p>

                      {faculties.length === 0 && (
                        <button
                          onClick={openAddModal}
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                        >
                          <Plus className="h-4 w-4" />
                          Add First Faculty
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredFaculties.map((faculty) => (
                    <tr
                      key={faculty.id}
                      className="border-b border-white/5 transition hover:bg-white/[0.02]"
                    >

                      {/* FACULTY */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-400">
                            {faculty.name
                              ?.split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-white">
                              {faculty.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {faculty.email}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* FACULTY ID */}

                      <td className="px-5 py-4 text-sm text-gray-300">
                        {faculty.faculty_id}
                      </td>

                      {/* DEPARTMENT */}

                      <td className="px-5 py-4 text-sm text-gray-300">
                        {faculty.department || "—"}
                      </td>

                      {/* DESIGNATION */}

                      <td className="px-5 py-4 text-sm text-gray-300">
                        {faculty.designation || "—"}
                      </td>

                      {/* CONTACT */}

                      <td className="px-5 py-4">
                        <div className="space-y-1">

                          {faculty.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Phone className="h-3.5 w-3.5 text-gray-600" />
                              {faculty.phone}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Mail className="h-3.5 w-3.5 text-gray-600" />
                            {faculty.email}
                          </div>

                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            faculty.status
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {faculty.status
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEditModal(faculty)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(faculty)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
            <div className="border-t border-white/10 px-5 py-4 text-xs text-gray-500">
              Showing {filteredFaculties.length} of{" "}
              {faculties.length} faculty members
            </div>
          )}

        </div>

      </div>

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#11141b] shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">

              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingFaculty
                    ? "Edit Faculty"
                    : "Add Faculty"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {editingFaculty
                    ? "Update faculty member information"
                    : "Add a new faculty member to AttendSmart"}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={submitting}
                className="text-gray-600 transition hover:text-gray-300 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              <div className="grid gap-5 px-6 py-6 md:grid-cols-2">

                {/* FACULTY ID */}

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-400">
                    Faculty ID
                  </label>

                  <input
                    type="text"
                    name="faculty_id"
                    value={form.faculty_id}
                    onChange={handleChange}
                    placeholder="e.g. FAC2026001"
                    disabled={!!editingFaculty}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#191c24] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                </div>

                {/* NAME */}

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-400">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Faculty name"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#191c24] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-400">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="faculty@example.com"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#191c24] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50"
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-400">
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="w-full rounded-xl border border-white/10 bg-[#191c24] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50"
                  />
                </div>

                {/* DEPARTMENT */}

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-400">
                    Department
                  </label>

                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                    className="w-full rounded-xl border border-white/10 bg-[#191c24] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50"
                  />
                </div>

                {/* DESIGNATION */}

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-400">
                    Designation
                  </label>

                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="e.g. Assistant Professor"
                    className="w-full rounded-xl border border-white/10 bg-[#191c24] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500/50"
                  />
                </div>

              </div>

              {/* FOOTER */}

              <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingFaculty
                    ? "Save Changes"
                    : "Add Faculty"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}