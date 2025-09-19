// components/EventCard.jsx
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoLocationSharp } from "react-icons/io5";
import { usePrivy } from "@privy-io/react-auth";

const EventCard = ({ event }) => {
  const [imageError, setImageError] = useState(false);
  const { ready, authenticated } = usePrivy();

  // Get image URL with fallback
  const getImageUrl = () => {
    if (!event.event_image || imageError) {
      return "/assets/images/default-event.jpg"; 
    }

    // If it's already a full URL
    if (event.event_image.startsWith("http")) {
      return event.event_image;
    }

    // If it's a relative path from your API
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL || "https://byro.onrender.com";
    return `${baseURL}${event.event_image}`;
  };

  // Extract event data
  const eventId = event.id || event._id;
  const eventTitle = event.title || event.name;
  const eventDate = event.day || event.startDate || event.eventDate;
  const time = event?.time_from;
  const eventLocation = event.location || event.venue;
  const eventHost = event.host || event.organizer || "Host Name";
  const eventPrice = event.price || event.ticketPrice || 0;
  const isFree = event.isFree || eventPrice === 0;
  const eventSlug = event.slug || eventId;
  const eventType = event.eventType || event.type || "ONLINE EVENT";

  // Get image URL
  // const getImageUrl = () => {
  //   const imageField = event.image || event.event_image || event.banner;
  //   console.log("Image field", event?.event_image);

  //   if (!imageField || imageError) {
  //     return "/assets/images/default-event.jpg";
  //   }

  //   if (imageField.startsWith("http")) {
  //     return imageField;
  //   }

  //   const baseURL =
  //     process.env.NEXT_PUBLIC_API_URL || "https://byro.onrender.com/";
  //   return `${baseURL.replace("/api/", "")}${imageField}`;
  // };

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
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-3">
        {/* Event Image */}
        <div className="relative h-48 w-full overflow-hidden rounded-lg">
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
          {authenticated && (
            <div className="absolute top-2 left-2">
              <span
                className={`${
                  isFree
                    ? "bg-[#007AFF] text-white"
                    : "bg-[#D9EBFF] text-[#007AFF]"
                } backdrop-blur-sm px-3 py-1 rounded-[5px] text-[10px] font-semibold`}
              >
                {isFree ? "Going" : `Manage`}
              </span>
            </div>
          )}
        </div>

        {/* Event Content */}
        <div className="p-2">
          {/* Event Title */}
          <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {eventTitle}
          </h3>

          {/* Event Date */}
          <p className="text-blue-600 text-sm font-medium mb-4">
            {formatDate(eventDate)}
          </p>

          {/* Action Buttons Row */}
          {/* <div className="flex items-center justify-between">
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
          </div> */}
          <div className="flex items-center gap-1">
            <div>
              <IoLocationSharp size={15} color="#007AFF" />
            </div>
            <p className="text-[#7E7E7E] text-[12px]">
              {isFree ? eventLocation : "Event hosted by you"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
