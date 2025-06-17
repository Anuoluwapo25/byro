import React, { useState } from "react";
import { toast } from "react-toastify";
import API from "../../services/api";
import { useRouter } from "next/navigation";

const RegisterModal = ({ isOpen, onClose, eventSlug, eventPrice = "Free" }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!eventSlug) {
      toast.error("Invalid event");
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      console.log("Registering for event:", eventSlug, "with data:", formData);
      const response = await API.registerEvent(eventSlug, formData);
      console.log("Registration response:", response);
      
      if (eventPrice === "Free") {
        // For free events, store ticket data and redirect to confirmation page
        const ticketData = {
          eventName: response.event_name || "Event",
          eventDate: response.event_date || "Date to be announced",
          eventLocation: response.event_location || "Location to be announced",
          timeFrom: response.event_time || "Time to be announced",
          ticketId: response.ticket_id || Math.random().toString(36).substr(2, 9),
          attendeeName: formData.name,
          attendeeEmail: formData.email
        };
        
        // Store ticket data in localStorage
        localStorage.setItem('ticketData', JSON.stringify(ticketData));
        
        // Redirect to confirmation page
        router.push('/ticket-confirmation');
      } else {
        // For paid events, redirect to payment page with event details
        if (response.ticket_url) {
          const paymentData = {
            amount: eventPrice,
            description: `Ticket for ${formData.name}`,
            name: formData.name
          };
          
          // Store payment data in localStorage for the payment page
          localStorage.setItem('paymentData', JSON.stringify(paymentData));
          
          // Redirect to payment page
          router.push('/payment');
        }
      }
    } catch (error) {
      console.error("Registration failed:", error);
      // Check for specific error types
      if (error.response?.status === 400) {
        toast.error(error.response.data?.message || "Invalid registration data");
      } else if (error.response?.status === 401) {
        toast.error("Please sign in to register for events");
      } else if (error.response?.status === 404) {
        toast.error("Event not found");
      } else {
        toast.error(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg max-h-[90vh] overflow-auto py-10">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-lg font-bold"
        >
          &times;
        </button>

        <div className="mt-3 sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            Claim your Ticket
          </h2>
          {eventPrice !== "Free" && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Event Price: ${eventPrice}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
                Full Name:
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-100 border-3 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                Email:
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-100 border-3 sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-blue-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : eventPrice === "Free" ? "Get Ticket" : "Proceed to Payment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;