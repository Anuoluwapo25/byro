// components/EventCard.jsx
import React from "react";

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
        <h3 className="font-medium text-sm">{event.title}</h3>
        <p className="text-blue-500 text-xs mt-1">{event.date}</p>
        <p className="text-gray-500 text-xs mt-2">
          {event.type} - {event.host}
        </p>
      </div>
    </div>
  );
};

export default EventCard;
