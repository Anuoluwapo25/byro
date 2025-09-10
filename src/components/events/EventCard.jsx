// components/EventCard.jsx
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const EventCard = ({ event }) => {
  const [imageError, setImageError] = useState(false);

  // Get image URL with fallback
  const getImageUrl = () => {
    if (!event.event_image || imageError) {
      return "/assets/images/default-event.jpg"; // Make sure this fallback image exists
    }

    // If it's already a full URL
    if (event.event_image.startsWith('http')) {
      return event.event_image;
    }

    // If it's a relative path from your API
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://byro.onrender.com";
    return `${baseURL}${event.event_image}`;
  };

  // Extract event data
  const eventId = event.id || event._id;
  const eventTitle = event.title || event.name;
  const eventDate = event.date || event.startDate || event.eventDate;
  const eventLocation = event.location || event.venue;
  const eventHost = event.host || event.organizer || "Host Name";
  const eventPrice = event.price || event.ticketPrice || 0;
  const isFree = event.isFree || eventPrice === 0;
  const eventSlug = event.slug || eventId;
  const eventType = event.eventType || event.type || "ONLINE EVENT";

<<<<<<< HEAD
=======
  // Get image URL
  const getImageUrl = () => {
    const imageField = event.image || event.event_image || event.banner;
    console.log("Image field", event?.event_image);

    if (!imageField || imageError) {
      return "/assets/images/default-event.jpg";
    }

    if (imageField.startsWith("http")) {
      return imageField;
    }

    const baseURL =
      process.env.NEXT_PUBLIC_API_URL || "https://byro.onrender.com/";
    return `${baseURL.replace("/api/", "")}${imageField}`;
  };

>>>>>>> 91a3d2559c66740a83ffe043aa203866a7a4946b
  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Link href={`/${eventSlug}`} className="block group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
        {/* Event Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={getImageUrl()}
            alt={eventTitle || "Event"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
            priority={false}
            loading="lazy"
            quality={75}
          />

          {/* FREE Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
              {isFree ? "FREE" : `$${eventPrice}`}
            </span>
          </div>
        </div>

        {/* Event Content */}
        <div className="p-5">
          {/* Event Title */}
          <h3 className="font-semibold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {eventTitle}
          </h3>

          {/* Event Date */}
          <p className="text-blue-600 text-sm font-medium mb-4">
            {formatDate(eventDate)}
          </p>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between">
            {event.isUserHost ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // Handle manage event
                }}
                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                Manage Event
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // Handle going to event
                }}
                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                Going
              </button>
            )}

            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                {eventType}
              </p>
              <p className="text-sm text-gray-600">
                {event.isUserHost ? "You hosted this event" : eventHost}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
