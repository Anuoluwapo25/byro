import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL,
  baseURL: "https://byro.onrender.com/api/",
  // baseURL: "https://byro-32ux.onrender.com/api/",

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

// Normalize token function (same as in api.js)
const normalizeToken = (token) => {
  if (!token) return null;
  if (typeof token === "object") {
    // Handle backend response format: { access: "...", refresh: "..." }
    // Also handle other common formats
    token = token.access || token.access_token || token.accessToken || token.token || token?.idToken || "";
  }
  token = String(token).trim();
  if (!token) return null;
  return token.startsWith("Bearer ") ? token.slice(7).trim() : token;
};

// Request interceptor for auth token and common headers
axiosInstance.interceptors.request.use(
  (config) => {
    // For FormData, remove Content-Type to let axios set it with boundary
    if (config.data instanceof FormData) {
      // Remove any Content-Type header - axios will set it automatically with boundary
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    // Check if Authorization header is already set (from api.js setAuthToken)
    if (config.headers.Authorization || axiosInstance.defaults.headers.common["Authorization"]) {
      // Header already set, just ensure Content-Type (but don't override FormData)
      if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
      }
      return config;
    }

    // Try multiple keys because different parts of the app may store the token differently
    let token = null;
    
    // Try authToken first (most reliable, set by API.setAuthToken)
    token = localStorage.getItem("authToken");
    
    // If not found, try token from Redux (might be JSON string)
    if (!token) {
      try {
        const persistedToken = localStorage.getItem("token");
        if (persistedToken) {
          // Try to parse as JSON first (Redux persist stores as JSON)
          try {
            const parsed = JSON.parse(persistedToken);
            token = normalizeToken(parsed);
          } catch (parseError) {
            // If parsing fails, treat as plain string
            token = normalizeToken(persistedToken);
          }
        }
      } catch (error) {
        console.error("Error retrieving token from localStorage:", error);
      }
    }

    // Try accessToken as fallback
    if (!token) {
      token = normalizeToken(localStorage.getItem("accessToken"));
    }

    // Normalize and set token
    const normalizedToken = normalizeToken(token);
    if (normalizedToken) {
      config.headers.Authorization = `Bearer ${normalizedToken}`;
    }
    
    // Don't override Content-Type for FormData - axios will set it with boundary
    // Only set Content-Type if it's not already set and it's not FormData
    if (!(config.data instanceof FormData) && !config.headers["Content-Type"]) {
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
