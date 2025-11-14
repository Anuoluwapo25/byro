import API from "../../../services/api";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Schedule, Location, schedule } from "../../assets";
import Image from "next/image";
import { Link, ExternalLink, Edit3, Plus, Trash2 } from "lucide-react";

export default function EventDetails() {
  const params = useParams();
  const { slug } = params;
  const [event, setEvent] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showAddHost, setShowAddHost] = useState(false);
  const [newHostEmail, setNewHostEmail] = useState("");
  const [newHostName, setNewHostName] = useState("");

  useEffect(() => {
    async function fetchEvent() {
      try {
        const data = await API.getEvent(slug);
        setEvent(data);
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    }
    if (slug) fetchEvent();
  }, [slug]);

  const handleCopyLink = async () => {
    const eventLink = `${window.location.origin}/${event?.slug}`;
    try {
      await navigator.clipboard.writeText(eventLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  const [hosts, setHosts] = useState([
    {
      id: 1,
      name: "Francis David",
      email: "disual0@byro.com",
      role: "Creator",
    },
    {
      id: 2,
      name: "Robert Okechukwu",
      email: "roke@byro.com",
      role: "Host",
    },
    {
      id: 3,
      name: "Samuel Okoro",
      email: "Samoro@byro.com",
      role: "Event manager",
    },
  ]);

  const handleAddHost = async () => {
    if (!newHostName || !newHostEmail) return;

    try {
      const response = await fetch(`/api/events/${slug}/add_cohost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newHostName,
          email: newHostEmail,
          role: "Host",
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add host");
      }
  
      const data = await response.json();
  
      // Assuming your API returns the newly added host
      setHosts((prev) => [...prev, data]);
      setNewHostName("");
      setNewHostEmail("");
      setShowAddHost(false);
    } catch (error) {
      console.error(error);
      alert("Error adding host, please try again.");
    }
  };

  const handleRemoveHost = (hostId) => {
    setHosts(hosts.filter((host) => host.id !== hostId));
  };


  const eventData = event;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Event Image */}
        <div className="lg:w-1/2 flex flex-col">
          {/* Event Details Card */}
          <div className=" rounded-2xl p-6">
            {/* Schedule Section */}
            <div className="flex items-start mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <Image src={schedule} alt="schedule" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-black mb-1">
                  {eventData?.day}
                </p>
                <p className="text-base text-black">
                  {eventData?.time_from} to {eventData?.time_to}
                </p>
              </div>
            </div>

            {/* Location Section */}
            <div className="flex items-start">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                <Image src={Location} alt="location" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-black mb-1">
                  {eventData?.location}
                </p>
                <p className="text-base text-black">{eventData?.address}</p>
              </div>
            </div>
          </div>

          {/* Copy Event Link */}
          <div className="px-6">
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-2 text-[#4F8BFF] hover:text-blue-700 transition-colors "
            >
              <Link className="w-5 h-5" />
              <span className="font-medium">
                {copySuccess ? "Link Copied!" : "Copy Event Link"}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column - Event Info */}
        <div className="lg:w-1/2">
          <div className="relative">
            <img
              src={eventData?.event_image}
              alt={eventData?.name}
              className="w-full h-[244px] lg:h-[244px] object-cover rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Host Management Section */}
      <div className="mt-8 bg-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Host</h3>
            <p className="text-gray-500 text-sm mt-1">
              Add, Host, Event Manager
            </p>
          </div>
          <button
            onClick={() => setShowAddHost(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Host</span>
          </button>
        </div>

        <div className="space-y-4">
          {hosts.map((host) => (
            <div
              key={host.id}
              className="flex items-center justify-between p-4 gap-x-3 rounded-lg"
            >
              <div className="font-semibold text-[#3D4852] w-1/4 ">
                {host.name}
              </div>
              <div className="text-sm  text-[#3D4852] w-1/4 ">{host.email}</div>
              <div className="w-1/4 flex justify-start items-center ">
                {" "}
                <div className="text-sm text-blue-600 font-medium px-3 ">
                  {host.role}
                </div>
              </div>

              <div className="flex items-center space-x-4 w-1/4 justify-center ">
                {host.role !== "Creator" && (
                  <button
                    onClick={() => handleRemoveHost(host.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Host Modal */}
        {showAddHost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Add New Host</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newHostName}
                    onChange={(e) => setNewHostName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter host name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newHostEmail}
                    onChange={(e) => setNewHostEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddHost(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddHost}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Host
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
