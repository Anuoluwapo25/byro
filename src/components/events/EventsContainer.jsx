// components/EventsContainer.jsx
import React, { useState, useEffect } from "react";
import { fetchHappeningEvents } from "@/services/eventServices";
import EventCard from "./EventCard";

const EventsContainer = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const happeningEvents = await fetchHappeningEvents();

        if (Array.isArray(happeningEvents)) {
          setEvents(happeningEvents);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Error loading events:", err);
        setError(err.message);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
       
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-5">
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="text-right">
                  <div className="h-3 bg-gray-200 rounded mb-1 w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <p className="text-lg font-semibold">Error loading events</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!Array.isArray(events) || events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No events in your location
        </h3>
        <p className="text-white max-w-md mx-auto">
          Check back later for upcoming events or create your own event to get
          started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {events.map((event) => (
        <EventCard key={event.id || event._id || Math.random()} event={event} />
      ))}
    </div>
  );
};

export default EventsContainer;
