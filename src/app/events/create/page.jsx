"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EventCreationForm from "../../../components/events/EventCreationForm";
// import GetStarted from "../../../components/GetStarted";

export default function CreateEventPage() {
  const { ready, authenticated, login } = usePrivy();
  const [loginTriggered, setLoginTriggered] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //   if (ready && !authenticated) {
  //     login(); // Automatically open the Privy login modal
  //     setLoginTriggered(true);
  //   }
  // }, [ready, authenticated, login]);

  // if (!ready) return <p>Loading...</p>;

  return (
    <div className="bg-main-section bg-fixed bg-cover bg-center bg-no-repeat min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <EventCreationForm />
          {/* {authenticated ? (
            <EventCreationForm />
          ) : null
          // Or keep empty since login modal is open
          } */}
        </div>
      </div>
    </div>
  );
}
