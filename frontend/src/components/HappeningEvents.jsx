"use client";

import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import EventsContainer from "./events/EventsContainer";
import { fetchHappeningEvents } from "../services/eventServices";
import Link from "next/link";
// import { fetchEventsByLocation } from "@/lib/api";

const HappeningEvents = () => {
  const [loading, setLoading] = useState(false);
  const [happeningEvents, setHappeningEvents] = useState([]);

  useEffect(() => {
    // Load initial data
    const loadEvents = async () => {
      setLoading(true);
      try {
        const [happening] = await Promise.all([fetchHappeningEvents()]);
        setHappeningEvents(happening);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  console.log("Happening Events:", happeningEvents);
  const filteredEvents = happeningEvents.slice(0, 6);

  console.log("Filtered Events:", filteredEvents);

  return (
    <div className="p-8 bg-blue-600">
      <div>
        <input
          type="search"
          name="event-search"
          id=""
          placeholder="Search for Events"
          className="bg-transparent border-b-2 border-black focus:border-black focus:outline-none w-[30%] text-black text-lg placeholder:text-white placeholder:text-base"
        />
      </div>
      <div className="container mx-auto md:p-8">
        <h2 className="text-white font-bold text-3xl text-center py-6">
          Events <span className="text-black">around you</span>
        </h2>

        <EventsContainer events={filteredEvents} />
      </div>

      <div className="justify-center text-center mx-auto">
        <Link href="/events">
          <button className="bg-gray-50 text-black font-semibold py-2 px-4 rounded">
            Load More
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HappeningEvents;
