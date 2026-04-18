"use client";

import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useEffect } from "react";
import EventCreationForm from "../../../components/events/EventCreationForm";
import AppLayout from "@/layout/app";
import API from "@/services/api";
import { toast } from "react-toastify";

export default function EditEventPage() {
  const { connect, isConnected } = useWeb3AuthConnect();

  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  const handleEventCreated = async (eventData) => {
    try {
      const response = await API.createEvent(eventData);

      console.log("Event created:", response);
      toast.success("Event created successfully!");
      // router.push(`/events/${response.slug}`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };

  return (
    <AppLayout>
      <div className="bg-white min-h-screen">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <EventCreationForm onSuccess={handleEventCreated} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
