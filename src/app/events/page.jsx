// pages/events.js (or app/events/page.js in App Router)
"use client";

import { useState, useEffect } from "react";
import EventsContainer from "../../components/events/EventsContainer";
import EmptyState from "../../components//events/EmptyState";
import EventsTabs from "../../components/events/EventsTabs";
import {
  fetchUpcomingEvents,
  fetchPastEvents,
} from "../../services/eventServices";

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
    // In a real app, this would likely open a modal or navigate to a create event page
    console.log("Create event clicked");
    alert("Create event functionality would open here");

    // In a real application, you might use a modal or redirect:
    // router.push('/events/create');
    // or
    // setShowCreateEventModal(true);
  };

  // Determine which events to display based on active tab
  const events = activeTab === "upcoming" ? upcomingEvents : pastEvents;
  const showEmptyState =
    activeTab === "upcoming" && upcomingEvents.length === 0;

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Events</h1>
          <EventsTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
        <div className="flex justify-center items-center h-64">
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <EventsTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {showEmptyState ? (
        <EmptyState onCreateEvent={handleCreateEvent} />
      ) : (
        <EventsContainer events={events} onCreateEvent={handleCreateEvent} />
      )}
    </div>
  );
}
