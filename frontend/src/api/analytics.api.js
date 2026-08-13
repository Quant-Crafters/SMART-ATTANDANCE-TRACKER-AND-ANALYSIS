import api from "./client";

export const getDashboardAnalytics = async () => {
  const response = await api.get("/api/analytics/dashboard");
  return response.data;
};