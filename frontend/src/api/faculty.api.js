import api from "./client";

export const getFaculties = async () => {
  const response = await api.get("/api/faculty/");
  return response.data;
};

export const getFacultyById = async (id) => {
  const response = await api.get(`/api/faculty/${id}`);
  return response.data;
};

export const createFaculty = async (facultyData) => {
  const response = await api.post("/api/faculty/", facultyData);
  return response.data;
};

export const updateFaculty = async (id, facultyData) => {
  const response = await api.put(`/api/faculty/${id}`, facultyData);
  return response.data;
};

export const deleteFaculty = async (id) => {
  const response = await api.delete(`/api/faculty/${id}`);
  return response.data;
};