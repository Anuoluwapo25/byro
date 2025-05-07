// components/EventsContainer.jsx
import React from "react";
import EventCard from "./EventCard";

const EventsContainer = ({ events, onCreateEvent }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={onCreateEvent}
          className="bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-6 rounded-full transition-colors"
        >
          Create Event
        </button>
      </div>
    </>
  );
};

export default EventsContainer;
