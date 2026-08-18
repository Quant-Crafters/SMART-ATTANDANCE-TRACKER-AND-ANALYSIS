import api from "./client";

/*
 * Get all students.
 * Used by Admin / Faculty pages.
 */
export const getStudents = async () => {
  const response = await api.get("/api/students");
  return response.data;
};

/*
 * Get a single student by database ID.
 */
export const getStudentById = async (id) => {
  const response = await api.get(
    `/api/students/${id}`
  );

  return response.data;
};

/*
 * Get the currently authenticated student.
 *
 * IMPORTANT:
 * The backend determines the student from the JWT.
 * We do NOT send a student ID from the browser.
 */
export const getMyStudentProfile = async () => {
  const response = await api.get(
    "/api/students/me"
  );

  return response.data;
};

/*
 * Get the currently authenticated student's dashboard.
 *
 * IMPORTANT:
 * The backend determines the student from the JWT.
 * We do NOT send a student ID from the browser.
 */
export const getMyStudentDashboard = async () => {
  const response = await api.get(
    "/api/student/dashboard"
  );

  return response.data;
};

/*
 * Create student.
 */
export const createStudent = async (
  studentData
) => {
  const response = await api.post(
    "/api/students",
    studentData
  );

  return response.data;
};

/*
 * Update student.
 */
export const updateStudent = async (
  id,
  studentData
) => {
  const response = await api.put(
    `/api/students/${id}`,
    studentData
  );

  return response.data;
};

/*
 * Delete student.
 */
export const deleteStudent = async (id) => {
  const response = await api.delete(
    `/api/students/${id}`
  );

  return response.data;
};