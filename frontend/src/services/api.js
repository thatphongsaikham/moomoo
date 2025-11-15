import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  withCredentials: true, // Send cookies with requests (for JWT)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add JWT token to headers if available
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (if stored there)
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Redirect to login if on admin route
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      }
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      console.error("Access denied: Insufficient permissions");
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error: Please check your connection");
    }

    return Promise.reject(error);
  }
);

export default api;
