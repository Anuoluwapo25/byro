import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://byro.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    // Add other default headers if needed
  }
});

// Custom method defined *outside* the config object
axiosInstance.createEvent = (eventData) => 
  axiosInstance.post("/events/", eventData, {
    headers: {
      "Content-Type": "multipart/form-data", // Required for file uploads
    },
  });

// Request interceptor for auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Handle token expiration (e.g., redirect to login)
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
