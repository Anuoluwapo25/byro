import axiosInstance from "../utils/axios";

// Unified error handler
const handleApiError = (error) => {
  if (error.response) {
    console.error("API Error Response:", {
      status: error.response.status,
      data: error.response.data,
    });
    throw Error(
      error.response.data?.message || "An unexpected error occurred"
    );
  } else if (error.request) {
    console.error("API No Response:", error.request);
    throw new Error("No response from server. Please check your connection.");
  } else {
    console.error("API Request Error:", error.message);
    throw new Error("Error setting up request: " + error.message);
  }
};

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

const setAuthToken = (token) => {
  const t = normalizeToken(token);
  if (t) {
    localStorage.setItem("authToken", t);
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    console.log("[API] setAuthToken -> Bearer", t.slice(0, 8) + "..."); // safe logging
  } else {
    localStorage.removeItem("authToken");
    delete axiosInstance.defaults.headers.common["Authorization"];
    console.log("[API] cleared auth token");
  }
};

// request interceptor: ensure header and log it
axiosInstance.interceptors.request.use((config) => {
  const hdr = config.headers?.Authorization || axiosInstance.defaults.headers.common["Authorization"];
  console.log("[API] Request Authorization header:", hdr);
  return config;
});

const API = {
  // Set auth token
  setAuthToken,

  // ===== EVENTS =====
  createEvent: async (formData, accessToken) => {
    try {
      console.log("Sending form data to API:", formData);

      // prefer explicit accessToken, else try stored token
      const t = normalizeToken(accessToken) || normalizeToken(localStorage.getItem("authToken"));

      // if we have a token, ensure axios defaults are set (keeps logs consistent)
      if (t) {
        setAuthToken(t);
      }

      // Ensure we're always using FormData for file uploads
      let body;
      if (formData instanceof FormData) {
        // Already FormData, use it directly
        body = formData;
        console.log("Using provided FormData");
      } else {
        // Convert object to FormData
        body = new FormData();
        Object.keys(formData || {}).forEach((key) => {
          const val = formData[key];
          if (val !== undefined && val !== null) {
            if (Array.isArray(val)) {
              val.forEach(v => body.append(key, v));
            } else if (val instanceof File || val instanceof Blob) {
              // Handle File/Blob objects
              body.append(key, val);
            } else {
              body.append(key, val);
            }
          }
        });
        console.log("Converted object to FormData");
      }

      // Log FormData entries for debugging (note: FormData.entries() is not enumerable)
      if (body instanceof FormData) {
        console.log("FormData prepared for upload");
        // Check if file is present
        if (body.has('event_image')) {
          console.log("event_image field found in FormData");
        }
      }

      // Send with FormData - axios will automatically set Content-Type with boundary
      const response = await axiosInstance.post("/events/", body, {
        headers: {
          // Don't set Content-Type - axios will set it automatically as:
          // Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
        },
      });

      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error);
      throw handleApiError(error);
    }
  },

  getEvent: async (slug) => {
    try {
      const response = await axiosInstance.get(`/events/${slug}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getEventBySlug: async (slug) => {
    try {
      const response = await axiosInstance.get(`/events/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event by slug:', error);
      throw error;
    }
  },

  getEvents: async () => {
    try {
      const response = await axiosInstance.get("/events/");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Register for an event
  registerEvent: async (eventSlug, userData) => {
    try {
      console.log("Registration request details:", {
        url: `/events/${eventSlug}/register/`,
        userData
      }); 
      
      const response = await axiosInstance.post(
        `/events/${eventSlug}/register/`,
        {
          name: userData.name,
          email: userData.email
        }
      );
      console.log("Registration response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Registration error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        requestData: {
          url: `/events/${eventSlug}/register/`,
          userData
        }
      });
      
      if (error.response?.status === 404) {
        throw new Error('Event not found');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid registration data');
      }
      
      throw handleApiError(error);
    }
  },


  // Update an event
  updateEvent: async (slug, formData) => {
    try {
      const response = await axiosInstance.put(`/events/${slug}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Tickets
  transferTicket: async (ticketId, transferData) => {
    try {
      const response = await axiosInstance.post(
        `/${ticketId}/transfer/`,
        transferData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  cancelRegistration: async (ticketId) => {
    try {
      const response = await axiosInstance.delete(`/tickets/${ticketId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getTicket: async (ticketId) => {
    try {
      const response = await axiosInstance.get(`/tickets/${ticketId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },


  // Privy
  getPrivyToken: async (accessToken) => { 
    try {
      const t = normalizeToken(accessToken);
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const response = await axiosInstance.post("/auth/privy/", { accessToken }, { headers });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || "Invalid access token";
        throw new Error(errorMessage);
      }
      throw handleApiError(error);
    }
  },

  getIdToken: async (identityToken) => {
    try{
      const t = normalizeToken(identityToken);
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const response = await axiosInstance.post('/auth/privy/', { identityToken }, { headers });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || "Invalid identity token";
        throw new Error(errorMessage);
      }
      throw handleApiError(error);
    }
  },

  // Waitlist
  joinWaitlist: async (data) => {
    try {
      const response = await axiosInstance.post("/waitlist/", {
        email: data.email,
        source: "website"
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || "Invalid email format";
        throw new Error(errorMessage);
      }
      throw handleApiError(error);
    }
  },

};

export default API;