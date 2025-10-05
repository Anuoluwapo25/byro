"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Undo2 } from "lucide-react";
import EventMiniCard from "@/components/EventMiniCard";
import Footer from "@/components/Footer";
import {Tix} from "../assets/index";
import PaymentMethod from "@/components/PaymentMethod"

// import Navbar from "@/components/Navbar"

export default function EventRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "",
  });

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
    }
  };

  const steps = [
    { number: 1, title: "Basic", subtitle: "Information" },
    { number: 2, title: "Review", subtitle: "Details" },
    { number: 3, title: "Make Payment", subtitle: "" },
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      {/* <Navbar /> */}
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
                Complete your registration for Byro Event 2024
              </p>
            </div>
          )}
          ;
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
                    <label className="block  font-normal text-[#090909] mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className=" text-black w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#090909] mb-2">
                    How did you here about this event
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
                    How did you here about this event
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
                Back to Events
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                {currentStep === 3 ? "Complete Payment" : "Continue"}
              </button>
            </div>
          </div>

          <EventMiniCard />
        </div>
      </div>
      <Footer />
    </div>
  );
}
