// components/EmptyState.jsx
import React from "react";

const EmptyState = ({ onCreateEvent }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-4">
        <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" />
            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
          <div className="flex items-center justify-center">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" fill="#87B1FF" />
              <path d="M8 12a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2H8z" fill="#D7E5FF" />
              <path d="M15 8a1 1 0 0 0-2 0v8a1 1 0 1 0 2 0V8z" fill="#D7E5FF" />
            </svg>
          </div>
        </div>
      </div>
      <h3 className="text-xl font-semibold mt-6">No Upcoming Events</h3>
      <p className="text-gray-500 text-center mt-2">
        You have no upcoming events. Why not host one?
      </p>
      <button
        onClick={onCreateEvent}
        className="mt-6 bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-6 rounded-full transition-colors"
      >
        Create Event
      </button>
    </div>
  );
};

export default EmptyState;
