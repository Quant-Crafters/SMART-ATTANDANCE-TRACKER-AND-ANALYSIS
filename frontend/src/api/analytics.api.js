import api from "./client";

export const getDashboardAnalytics = async () => {
  const response = await api.get(
    "/api/analytics/dashboard"
  );

  return response.data;
};

/*
 * Get analytics for ONE student.
 */
export const getStudentAnalytics = async (
  studentId
) => {
  const response = await api.get(
    `/api/analytics/students/${studentId}`
  );

  return response.data;
};