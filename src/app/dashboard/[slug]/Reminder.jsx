import React, { useState } from "react";

const Reminder = () => {
  const [selectedRecipients, setSelectedRecipients] = useState("going");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const recipientOptions = [
    { value: "going", label: "Going", active: true },
    { value: "not_going", label: "Not going", active: false },
    { value: "waitlist", label: "Waitlist", active: false },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Send a reminder
        </h1>
        <p className="text-gray-600 text-sm">
          Attendees will receive reminder via email, SMS or in-app notification.
          It will also be shown on the event page.
        </p>
      </div>

      {/* Recipient Selection */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {recipientOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedRecipients(option.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedRecipients === option.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Field */}
      <div className="mb-4">
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Subject
        </label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          placeholder="Enter subject"
        />
      </div>

      {/* Message Field */}
      <div className="mb-6">
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
          placeholder="Enter your message..."
        />
      </div>

      {/* Send Button */}
      <div className="flex justify-start">
        <button className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200">
          Send
        </button>
      </div>
    </div>
  );
};

export default Reminder;
