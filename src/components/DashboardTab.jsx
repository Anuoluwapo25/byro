import React from 'react'

const DashboardTab = () => {
    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "attendees", label: "Attendees" },
        { id: "confirmation", label: "Confirmation" },
        { id: "reminder", label: "Reminder" },
      ];
  return (
    <div className="] border-b rounded-md">
    <div className="max-w-[30%]  px-4 sm:px-6 lg:px-8 bg-gray-300 rounded-md">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  </div>

  )
}

export default DashboardTab