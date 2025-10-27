"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Undo2 } from "lucide-react";
import EventMiniCard from "@/components/EventMiniCard";
import Footer from "@/components/Footer";
import { Tix } from "../../assets/index";
import PaymentMethod from "@/components/PaymentMethod";
import { useParams, useRouter } from "next/navigation";
import API from "../../../services/api"; // Import the API object
import { toast } from "sonner";

export default function EventRegistration() {
  const { slug } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "",
  });

  console.log(`regEventSlug: `, slug)

  // Fetch event data when component mounts
  useEffect(() => {
    const fetchEventData = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

           const token = localStorage.getItem('authToken');
      if (token) {
        API.setAuthToken(token);
      }

        // Use API.getEvent instead of getEvent
        const response = await API.getEvent(slug);
        console.log("Fetched event data:", response);
        setEvent(response);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err.message || "Failed to load event");
        toast.error(err.response?.data?.message || "Failed to load event details");

        // Optionally redirect back to events page after a delay
        // setTimeout(() => {
        //   router.push("/events");
        // }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [slug]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // Go back to event details page
      router.push(`/${slug}`);
    }
  };

  const steps = [
    { number: 1, title: "Basic", subtitle: "Information" },
    { number: 2, title: "Review", subtitle: "Details" },
    { number: 3, title: "Make Payment", subtitle: "" },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The event you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.push("/events")}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto mb-20">
        <div className="flex gap-24 ">
          {currentStep === 3 ? (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image src={Tix} alt="ticket-icon" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Choose Payment Method
                </h1>
              </div>
              <p className="text-gray-600">
                Select your preferred payment method to complete your ticket
                purchase
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image src={Tix} alt="ticket-icon" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Event Registration
                </h1>
              </div>
              <p className="text-gray-600">
                Complete your registration for <strong>{event.name}</strong>
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold text-lg ${
                      currentStep === step.number
                        ? "bg-green-500 text-white"
                        : currentStep > step.number
                        ? "bg-green-100 text-green-600 border-2 border-green-500"
                        : "bg-white text-gray-400 border-2 border-gray-200"
                    }`}
                  >
                    {step.number}
                  </div>
                  <div>
                    <div
                      className={`font-semibold ${
                        currentStep === step.number
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </div>
                    {step.subtitle && (
                      <div
                        className={`text-sm ${
                          currentStep === step.number
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {step.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-normal text-[#090909] mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="text-black w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#090909] mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="text-black w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#090909] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="text-black w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#090909] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="text-black w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#090909] mb-2">
                    How did you hear about this event
                  </label>
                  <input
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="text-black w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#090909] mb-2">
                      First Name
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {formData.firstName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#090909] mb-2">
                      Last Name
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {formData.lastName}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#090909] mb-2">
                    Email
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {formData.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#090909] mb-2">
                    Phone Number
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {formData.phone}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#090909] mb-2">
                    How did you hear about this event
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {formData.source}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 bg-none">
                <PaymentMethod />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 border-blue-500 text-blue-500 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Undo2 size={20} />
                {currentStep === 1 ? "Back to Event" : "Back"}
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                disabled={
                  currentStep === 1 &&
                  (!formData.firstName ||
                    !formData.lastName ||
                    !formData.email ||
                    !formData.phone)
                }
              >
                {currentStep === 3 ? "Complete Payment" : "Continue"}
              </button>
            </div>
          </div>

          <EventMiniCard event={event} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
