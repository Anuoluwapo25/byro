
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For App Router
import EventsContainer from "../../components/events/EventsContainer";
import EmptyState from "../../components//events/EmptyState";
import EventsTabs from "../../components/events/EventsTabs";
import {
  fetchUpcomingEvents,
  fetchPastEvents,
} from "../../services/eventServices";
import { mainBg } from "../assets";
import AppLayout from "@/layout/app";

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load initial data
    const loadEvents = async () => {
      setLoading(true);
      try {
        const [upcoming, past] = await Promise.all([
          fetchUpcomingEvents(),
          fetchPastEvents(),
        ]);
        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateEvent = () => {
    
    
    router.push("/events/create");
   
  };

  // Determine which events to display based on active tab
  const events = activeTab === "upcoming" ? upcomingEvents : pastEvents;
  const showEmptyState =
    activeTab === "upcoming" && upcomingEvents.length === 0;

  // Show loading state
  if (loading) {
    return (
      <AppLayout>
        {" "}
        <div className="bg-main-section bg-fixed bg-cover bg-center bg-no-repeat min-h-screen">
          <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-4xl font-extrabold">Events</h1>
              <EventsTabs activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
            <div className="flex justify-center items-center h-64">
              <p>Loading events...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {" "}
      <div className="relative bg-main-section bg-fixed bg-cover bg-center bg-no-repeat h-screen">
        {/* Soft overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/70 to-pink-100/70 z-0" />

        {/* Content goes here */}
        <div className="relative z-10 max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-4xl font-extrabold">Events</h1>
           
            <EventsTabs activeTab={activeTab} onTabChange={handleTabChange} />
          </div>

          {showEmptyState ? (
            <EmptyState onCreateEvent={handleCreateEvent} />
          ) : (
            <EventsContainer
              events={events}
              onCreateEvent={handleCreateEvent}
            />
          )}

        </div>
      </div>

     
    </AppLayout>
  );
}
