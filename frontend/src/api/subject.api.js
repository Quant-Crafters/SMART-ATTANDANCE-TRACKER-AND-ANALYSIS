import api from "./client";

export const getSubjects = async () => {
  const response = await api.get("/api/subjects/");
  return response.data;
};

export const getSubjectById = async (id) => {
  const response = await api.get(`/api/subjects/${id}`);
  return response.data;
};

export const createSubject = async (subjectData) => {
  const response = await api.post("/api/subjects/", subjectData);
  return response.data;
};

export const updateSubject = async (id, subjectData) => {
  const response = await api.put(
    `/api/subjects/${id}`,
    subjectData
  );
  return response.data;
};

export const deleteSubject = async (id) => {
  const response = await api.delete(`/api/subjects/${id}`);
  return response.data;
};