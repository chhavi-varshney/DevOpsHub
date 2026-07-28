import axios from "axios";

const BASE_URL = "http://localhost:5000/api/issues";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT Token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// Get All Issues
// ===============================
export const getIssues = async (filters = {}) => {
  const response = await api.get("/", {
    params: filters,
  });

  return response.data;
};

// ===============================
// Get Single Issue
// ===============================
export const getIssue = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

// ===============================
// Create Issue
// ===============================
export const createIssue = async (issueData) => {
  const response = await api.post("/", issueData);
  return response.data;
};

// ===============================
// Update Issue
// ===============================
export const updateIssue = async (id, issueData) => {
  const response = await api.put(`/${id}`, issueData);
  return response.data;
};

// ===============================
// Delete Issue
// ===============================
export const deleteIssue = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};