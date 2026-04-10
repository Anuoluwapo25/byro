import React from "react";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";

const EventMiniCard = ({ event }) => {
  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <img
        src={
          event?.image ||
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80"
        }
        alt={event?.name || "Event"}
        className="w-full h-48 object-cover rounded-xl mb-6"
      />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {event?.name || "Event"}
        </h2>
        <div className="flex items-center gap-2 text-blue-600">
          <Users size={20} />
          <span className="font-semibold">
            {event?.attendee_count || "0"}+ Attendees
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Calendar className="text-red-600" size={20} />
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {event?.day
                  ? new Date(event.day).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Date TBD"}
              </div>
              <div className="text-gray-600 text-sm">
                {event?.time_from && event?.time_to ? (
                  <>
                    {new Date(event.time_from).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    to{" "}
                    {new Date(event.time_to).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </>
                ) : (
                  "Time TBD"
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MapPin className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {event?.venue || event?.location || "Location TBD"}
              </div>
              <div className="text-gray-600 text-sm">
                {event?.city || "City TBD"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex justify-between mb-3">
          <span className="text-gray-600">Ticket</span>
          <span className="font-semibold text-gray-900">
            ${event?.price || "0"}
          </span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-gray-600">Processing Fees</span>
          <span className="font-semibold text-gray-900">{event.ticket_price}</span>
        </div>
        <div className="border-t pt-4 flex justify-between">
          <span className="font-bold text-blue-600">Total</span>
          <span className="font-bold text-blue-600 text-xl">
            ${event.ticket_price ? (parseFloat(event.price) + 1.5).toFixed(2) : "1.5"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventMiniCard;
