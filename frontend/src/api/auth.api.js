import api from "./client";

// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------

export const login = async (credentials) => {
  const response = await api.post("/api/login", credentials);

  return response.data;
};

// ------------------------------------------------------------
// REGISTER
// ------------------------------------------------------------

export const register = async (userData) => {
  const response = await api.post("/api/register", userData);

  return response.data;
};

// ------------------------------------------------------------
// CURRENT USER PROFILE
// ------------------------------------------------------------

export const getProfile = async () => {
  const response = await api.get("/api/profile");

  return response.data;
};

// ------------------------------------------------------------
// ADMIN PROFILE / DATA
// ------------------------------------------------------------

export const getAdmin = async () => {
  const response = await api.get("/api/admin");

  return response.data;
};