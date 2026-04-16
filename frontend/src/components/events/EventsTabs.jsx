// components/EventsTabs.jsx
import React from "react";
import Tab from "./Tab";

const EventsTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-2 bg-[#FAFAFA] p-1 rounded-lg">
      <Tab
        label="Upcoming"
        isActive={activeTab === "upcoming"}
        onClick={() => onTabChange("upcoming")}
      />
      <Tab
        label="Past"
        isActive={activeTab === "past"}
        onClick={() => onTabChange("past")}
      />
    </div>
  );
};

export default EventsTabs;
