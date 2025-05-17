// src/services/api.js
import axiosInstance from "../utils/axios";

const API = {
  // ===== EVENTS =====
  createEvent: async (formData) => {
    try {
      const response = await axiosInstance.post("/events/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getEvent: async (id) => {
    try {
      const response = await axiosInstance.get(`/events/${id}`);
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

  registerForEvent: async (eventId, userData) => {
    try {
      const response = await axiosInstance.post(
        `/events/${eventId}/register/`,
        userData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ===== TICKETS =====
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

  // ===== AUTH =====
  getPrivyToken: async (code) => {
    try {
      const response = await axiosInstance.post("/privy/token/", { code });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ===== PAYMENT =====
  createPaymentLink: async (data) => {
    try {
      const response = await axiosInstance.post("/payment-links/", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ===== PAYMENT SETTINGS =====
  getPaymentSettings: async () => {
    try {
      const response = await axiosInstance.get("/payment-settings/");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createPaymentSettings: async (data) => {
    try {
      const response = await axiosInstance.post("/payment-settings/", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updatePaymentSettings: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/payment-settings/${id}/`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ===== WAITLIST =====
  joinWaitlist: async (email) => {
    try {
      const response = await axiosInstance.post("/waitlist/", { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Unified error handler
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with non-2xx status
    console.error("API Error Response:", {
      status: error.response.status,
      data: error.response.data,
    });
    throw new Error(
      error.response.data?.message || "An unexpected error occurred"
    );
  } else if (error.request) {
    // No response received
    console.error("API No Response:", error.request);
    throw new Error("No response from server. Please check your connection.");
  } else {
    // Something wrong with request setup
    console.error("API Request Error:", error.message);
    throw new Error("Error setting up request: " + error.message);
  }
};

export default API;