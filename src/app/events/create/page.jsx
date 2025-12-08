"use client";

import React, { useState, useCallback, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import EventCreationForm from "../../../components/events/EventCreationForm";
import AppLayout from "@/layout/app";
import API from "@/services/api";
import { toast } from "react-toastify";

export default function CreateEventPage() {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Handle authentication
  useEffect(() => {
    if (ready) {
      if (!authenticated) {
        login();
      }
      setIsLoading(false);
    }
  }, [ready, authenticated, router]);

  const handleEventCreated = useCallback(
    async (eventData) => {
      try {
        setIsLoading(true);

        // get token from Privy
        const raw = await getAccessToken();
        console.log('[CreateEvent] raw token:', raw ? '[REDACTED]' : raw);

        if (!raw) {
          await login();
          const retry = await getAccessToken();
          if (!retry) throw new Error('Unable to obtain access token');
          API.setAuthToken(retry);
        } else {
          API.setAuthToken(raw);
        }

        // optional: verify axios header
        console.log('[CreateEvent] axios auth header:', axios.defaults.headers?.common?.Authorization);

        // now create event (createEvent will use axios defaults)
        const created = await API.createEvent(eventData);
        console.log('Event created', created);
        toast.success("Event created successfully!");
        router.push("/events");
      } catch (error) {
        console.error("Create event failed:", error);
        toast.error("Failed to create event");
        // handle error display
      } finally {
        setIsLoading(false);
      }
    },
    [getAccessToken, login, router]
  );

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
