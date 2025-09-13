"use client";

import React from "react";
import ExploreEventPage from "../../../components/events/ExploreEventPage";
import AppLayout from "@/layout/app";
import EventSearch from "@/components/events/EventSearch";

export default function BrowseEventPage() {
  return (
    <AppLayout>
      {" "}
      <div className="bg-white">
        <div className="py-3 mx-12">
          <EventSearch />{" "}
        </div>

        <div className="">
          <ExploreEventPage />
        </div>
      </div>
    </AppLayout>
  );
}
