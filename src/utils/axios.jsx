import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL,
  // baseURL: "https://byro.onrender.com/api/",
  baseURL: "https://byro-32ux.onrender.com/api/",

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
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
    // Try multiple keys because different parts of the app may store the token differently
    let token = null;
    try {
      const persistedToken = localStorage.getItem("token"); // redux-persist may store JSON string
      if (persistedToken) {
        token = JSON.parse(persistedToken);
      }
    } catch (_) {}

    if (!token) {
      token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure Content-Type is set for all requests if not provided
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
