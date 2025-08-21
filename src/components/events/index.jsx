"use client";

import { useState } from "react";

// Event type definition
const EventType = {
  ONLINE: "VIRTUAL",
  OFFLINE: "IN-PERSON",
};

// Sample event data
const sampleEvents = [
  {
    id: 1,
    title:
      "BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow",
    date: "Saturday, March 18, 9:30PM",
    type: EventType.ONLINE,
    host: "Host Name",
    isFree: true,
    image: "/images/event-bonfire.jpg",
  },
  {
    id: 2,
    title:
      "BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow",
    date: "Saturday, March 18, 9:30PM",
    type: EventType.ONLINE,
    host: "Host Name",
    isFree: true,
    image: "/images/event-concert.jpg",
  },
  {
    id: 3,
    title:
      "BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow",
    date: "Saturday, March 18, 9:30PM",
    type: EventType.ONLINE,
    host: "Host Name",
    isFree: true,
    image: "/images/event-crowd.jpg",
  },
];

// Event card component
const EventCard = ({ event }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
      <div className="relative">
        <div className="h-48 bg-gray-200 overflow-hidden">
          {/* Using a placeholder image since we can't load external images */}
          <img
            src="/api/placeholder/400/320"
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
        {event.isFree && (
          <span className="absolute top-2 left-2 bg-white text-xs font-semibold px-2 py-1 rounded">
            FREE
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm text-black">{event.title}</h3>
        <p className="text-blue-500 text-xs mt-1">{event.date}</p>
        <p className="text-gray-500 text-xs mt-2">
          {event.type} - {event.host}
        </p>
      </div>
    </div>
  );
};

// Empty state component
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

// Tab component
const Tab = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
        isActive ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-800"
      }`}
    >
      {label}
    </button>
  );
};

// Main Events component
export default function Events() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState(sampleEvents);

  const handleCreateEvent = () => {
    // In a real app, this would likely open a modal or navigate to a create event page
    console.log("Create event clicked");
    alert("Create event functionality would open here");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="flex space-x-2 bg-blue-50 p-1 rounded-full">
          <Tab
            label="Upcoming"
            isActive={activeTab === "upcoming"}
            onClick={() => setActiveTab("upcoming")}
          />
          <Tab
            label="Past"
            isActive={activeTab === "past"}
            onClick={() => setActiveTab("past")}
          />
        </div>
      </div>

      {activeTab === "upcoming" && upcomingEvents.length === 0 ? (
        <EmptyState onCreateEvent={handleCreateEvent} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {(activeTab === "upcoming" ? upcomingEvents : pastEvents).map(
              (event) => (
                <EventCard key={event.id} event={event} />
              )
            )}
          </div>
          <div className="flex justify-center mt-6">
            <button
              onClick={handleCreateEvent}
              className="bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-6 rounded-full transition-colors"
            >
              Create Event
            </button>
          </div>
        </>
      )}
    </div>
  );
}
