import React from "react";

const DashboardTab = ({ onNavigate, active }) => {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "attendees", label: "Attendees" },
    { id: "confirmation", label: "Confirmation" },
    { id: "reminder", label: "Reminder" },
    { id: "payout", label: "Payout" },
  ];
  return (
    <div className="w-full rounded-md flex py-4 bg-white">
      <nav className="w-full flex justify-between space-x-8 bg-gray-100 rounded-lg px-2 py-2 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-gray-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`py-2 px-4 border-gray-300 border-2 rounded-md font-medium text-sm transition-colors focus:outline-none ${
              active === tab.id
                ? "border-blue-500 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default DashboardTab;
