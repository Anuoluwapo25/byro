import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/',

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Enable sending cookies if needed
});

// Custom method defined *outside* the config object
axiosInstance.createEvent = (eventData) =>
  axiosInstance.post("/events/", eventData, {
    headers: {
      "Content-Type": "multipart/form-data", // Required for file uploads
    },
  });

// Request interceptor for auth token and common headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure Content-Type is set for all requests
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear the invalid token
      localStorage.removeItem("accessToken");
      // Let the component handle the authentication
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
