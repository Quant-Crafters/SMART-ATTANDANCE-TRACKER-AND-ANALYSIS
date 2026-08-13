import api from "./client";

export const getStudents = async () => {
  const response = await api.get("/api/students");
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await api.get(`/api/students/${id}`);
  return response.data;
};

export const createStudent = async (studentData) => {
  const response = await api.post("/api/students", studentData);
  return response.data;
};

export const updateStudent = async (id, studentData) => {
  const response = await api.put(`/api/students/${id}`, studentData);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/api/students/${id}`);
  return response.data;
};