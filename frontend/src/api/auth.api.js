import api from "./client";

export const login = async (credentials) => {
  const response = await api.post("/api/login", credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post("/api/register", userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/api/profile");
  return response.data;
};

export const getAdmin = async () => {
  const response = await api.get("/api/admin");
  return response.data;
};