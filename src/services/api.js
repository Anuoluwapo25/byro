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

// Set auth token for authenticated requests
const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

const API = {
  // Set auth token
  setAuthToken,

  // ===== EVENTS =====
  createEvent: async (formData) => {
    try {
      console.log("Sending form data to API:", formData); // Debug log
      const response = await axiosInstance.post("/events/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (data) => data, // Prevent axios from transforming FormData
      });
      console.log("API Response:", response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error); // Debug log
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
      const response = await axiosInstance.post(
        `/events/${eventSlug}/register/`,
        userData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Tickets
  transferTicket: async (ticketId, transferData) => {
    try {
      const response = await axiosInstance.post(
        `/tickets/${ticketId}/transfer/`,
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
      const response = await axiosInstance.post("/privy/token/", { 
        code: accessToken 
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || "Invalid access token";
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