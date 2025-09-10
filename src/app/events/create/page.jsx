"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EventCreationForm from "../../../components/events/EventCreationForm";
import AppLayout from "@/layout/app";

export default function CreateEventPage() {
  const { ready, authenticated, login } = usePrivy();
  // const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      login(); // shows login modal
    } else {
      setCheckedAuth(true);
    }
  }, [ready, authenticated, login]);

  if (!ready || !checkedAuth) {
    return;
  }

  return (
    <AppLayout>
      <div className="bg-main-section bg-fixed bg-cover bg-center bg-no-repeat min-h-screen">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            {authenticated && ready ? <EventCreationForm /> : null}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
