// components/EventCard.jsx
import { eventImage } from "../../app/assets/index";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const EventCard = ({ event }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
      <div className="relative p-3">
        <div className="h-48 bg-gray-200 overflow-hidden">
          {/* Using a placeholder image since we can't load external images */}
          {/* <img
            src="/api/placeholder/400/320"
            alt={event.title}
            className="w-full h-full object-cover"
          /> */}
          <Image
            src={eventImage}
            alt={event.title}
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        {event.isFree && (
          <span className="absolute top-5 left-5 bg-white text-xs text-[#007AFF] font-semibold px-2 py-1 rounded">
            FREE
          </span>
        )}
      </div>
      <div className="p-4">
        <Link
          href="/events/viewevent/[id]"
          as={`/events/viewevent/${event.id}`}
        >
          <h3 className="font-medium text-sm">{event.title}</h3>
          <p className="text-blue-500 text-xs mt-1">{event.date}</p>
          <p className="text-gray-500 text-xs mt-2">
            {event.type} - {event.host}
          </p>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
