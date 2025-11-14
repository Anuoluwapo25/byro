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
  createEvent: async (formData, accessToken) => {
    try {
      console.log("Sending form data to API:", formData); 
      const response = await axiosInstance.post("/events/", formData, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (data) => data, 
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
      const response = await axiosInstance.post("/auth/privy/", { 
        accessToken: accessToken 
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

  getIdToken: async (identityToken) => {
    try{
      const response = await axiosInstance.post ('/auth/privy/', {
        identityToken: identityToken
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${identityToken}` // Use identity token
        }
      });
      return response.data
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