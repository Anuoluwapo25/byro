import React from "react";
import ExploreEventPage from "../../../components/events/ExploreEventPage";

export default function BrowseEventPage() {
  return (

    <div className="absolute inset-0 bg-main-section bg-fixed bg-cover bg-center bg-no-repeat z-0">
      <div className="relative inset-0 bg-gray-50 z-0 opacity-70" /> 

      <div className="p-20">
        <ExploreEventPage />
      </div>
    </div>
   
  );
}
