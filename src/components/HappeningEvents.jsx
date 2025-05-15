"use client";

import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import EventsContainer from "./events/EventsContainer";
import { fetchHappeningEvents } from "../services/eventServices";
// import { fetchEventsByLocation } from "@/lib/api";





const HappeningEvents = () => {
  const [loading, setLoading] = useState(false);
    const [happeningEvents, setHappeningEvents] = useState([]);

    useEffect(() => {
    // Load initial data
    const loadEvents = async () => {
      setLoading(true);
      try {
        const [happening] = await Promise.all([
         fetchHappeningEvents()
        ]);
        setHappeningEvents(happening)
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);
  
  return (
    <div className="p-8 bg-blue-600">
      <div className="container mx-auto md:p-8">
        <h2 className="text-white font-bold text-3xl text-center py-6">
          Events <span className="text-black">around you</span>
        </h2>

        <EventsContainer events={happeningEvents}/>

        
      </div>
    </div>
  );
};

export default HappeningEvents;
