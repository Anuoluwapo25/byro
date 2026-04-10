import React, { useState } from "react";
import { UserPlus, Check, X } from "lucide-react";

const Confirmation = () => {
  const [attendeesData, setAttendeesData] = useState([
    {
      id: 1,
      name: "Francis David",
      email: "disual@byro.africa",
      status: "waitlisted", // waitlisted, going, not_going
    },
    {
      id: 2,
      name: "Robert Okechukwu",
      email: "roke@byro.africa",
      status: "waitlisted",
    },
    {
      id: 3,
      name: "Kira d Great",
      email: "kira@byro.africa",
      status: "waitlisted",
    },
    {
      id: 4,
      name: "Temitope",
      email: "temi@byro.africa",
      status: "waitlisted",
    },
    {
      id: 5,
      name: "Caleb",
      email: "caleb@byro.africa",
      status: "waitlisted",
    },
    {
      id: 6,
      name: "Samuel Ajayi",
      email: "Ajaece@tyms.com",
      status: "waitlisted",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const waitlistCount = attendeesData.filter(
    (attendee) => attendee.status === "waitlisted"
  ).length;
  const goingCount = attendeesData.filter(
    (attendee) => attendee.status === "going"
  ).length;
  const notGoingCount = attendeesData.filter(
    (attendee) => attendee.status === "not_going"
  ).length;

  const filteredAttendees = attendeesData.filter(
    (attendee) =>
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateAttendeeStatus = (attendeeId, newStatus) => {
    setAttendeesData((prev) =>
      prev.map((attendee) =>
        attendee.id === attendeeId
          ? { ...attendee, status: newStatus }
          : attendee
      )
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Stats Section */}
      <div className="flex justify-start mb-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex justify-center space-x-8">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                  <UserPlus className="w-3 h-3 text-white" />
                </div>
                <p className="text-gray-600 text-sm font-medium">Waitlist</p>
              </div>
              <p className="text-gray-900 font-bold text-xl">35</p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <p className="text-gray-600 text-sm font-medium">Going</p>
              </div>
              <p className="text-green-600 font-bold text-xl">{goingCount}</p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </div>
                <p className="text-gray-600 text-sm font-medium">Not Going</p>
              </div>
              <p className="text-red-500 font-bold text-xl">{notGoingCount}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ml-6 flex flex-col space-y-2">
          <button className="bg-[#007AFF] hover:bg-[#0056CC] text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 shadow-sm text-sm">
            Invite
          </button>

          <button className="bg-[#007AFF] hover:bg-[#0056CC] text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 shadow-sm text-sm">
            Edit event
          </button>
        </div>
      </div>

      {/* Header and Search */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-gray-900 font-bold text-xl">Waitlist</h1>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4">
            🔍
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 border-0 pl-9 pr-3 py-2 rounded-lg text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 w-64 text-sm"
            placeholder="search for attendee..."
          />
        </div>
      </div>

      {/* Waitlist */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        {filteredAttendees.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              No attendees found
            </h3>
            <p className="text-gray-600 text-sm">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAttendees.map((attendee, index) => (
              <div
                key={attendee.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150"
              >
                {/* Attendee Info */}
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#007AFF] to-[#0056CC] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {attendee.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-medium text-sm">
                      {attendee.name}
                    </h3>
                  </div>
                </div>

                {/* Email */}
                <div className="flex-1 min-w-0 px-4">
                  <p className="text-gray-600 text-sm">{attendee.email}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateAttendeeStatus(attendee.id, "going")}
                    className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors duration-150"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      updateAttendeeStatus(attendee.id, "not_going")
                    }
                    className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors duration-150"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Confirmation;
