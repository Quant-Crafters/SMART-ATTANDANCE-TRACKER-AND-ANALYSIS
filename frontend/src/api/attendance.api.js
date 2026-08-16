import api from "./client";

/*
 * Get all attendance records.
 *
 * Mainly used by Admin / Faculty.
 */
export const getAttendance = async () => {
  const response = await api.get("/api/attendance/");
  return response.data;
};

/*
 * Get attendance percentage for one student.
 */
export const getStudentAttendancePercentage =
  async (studentId) => {
    const response = await api.get(
      `/api/attendance/percentage/${studentId}`
    );

    return response.data;
  };

/*
 * Get attendance history for one student.
 */
export const getStudentAttendanceHistory =
  async (studentId) => {
    const response = await api.get(
      `/api/attendance/history/${studentId}`
    );

    return response.data;
  };