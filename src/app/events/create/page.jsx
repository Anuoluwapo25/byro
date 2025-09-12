"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EventCreationForm from "../../../components/events/EventCreationForm";
import AppLayout from "@/layout/app";

export default function CreateEventPage() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ready) {
      if (!authenticated) {
        login();
      }
      setIsLoading(false);
    }
  }, [ready, authenticated, router]);

  
  const handleEventCreated = async (eventData) => {
    try {
      setIsSubmitting(true);
      
      setTimeout(() => {
        router.push("/events");
      }, 2000);
    } catch (error) {
      console.error("Error handling event creation:", error);
      setIsSubmitting(false);
    }
  };


  if (!authenticated) {
    return null;
  }

  return (
    <AppLayout>
      <div className="bg-main-section bg-fixed bg-cover bg-center bg-no-repeat min-h-screen">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <EventCreationForm 
              onSuccess={handleEventCreated}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
