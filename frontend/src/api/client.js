import axios from "axios";

// ------------------------------------------------------------
// API BASE URL
// ------------------------------------------------------------
//
// Your API files already use paths such as:
//
//   /api/login
//   /api/profile
//   /api/student/dashboard
//
// Therefore the axios base URL should NOT end with /api.
//
// This normalization also protects us if VITE_API_URL
// accidentally contains /api.
// ------------------------------------------------------------

const rawBaseURL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

// Remove trailing slashes
let baseURL = rawBaseURL.replace(/\/+$/, "");

// Prevent /api/api/... when .env contains:
//
// http://localhost:8080/api
//
// while API files use:
//
// /api/login
if (baseURL.endsWith("/api")) {
  baseURL = baseURL.slice(0, -4);
}

// ------------------------------------------------------------
// Axios instance
// ------------------------------------------------------------

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ------------------------------------------------------------
// Automatically attach JWT token
// ------------------------------------------------------------

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ------------------------------------------------------------
// Response interceptor
// ------------------------------------------------------------
//
// If the backend returns 401, remove the stale token.
// We don't automatically redirect here because routing
// should remain controlled by AuthContext / ProtectedRoute.
// ------------------------------------------------------------

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

export default api;