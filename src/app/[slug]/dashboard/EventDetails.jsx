import API from "../../../services/api";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Schedule, Location } from "../../../app/assets";
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
      // You can add a success state here if needed
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
      name: "Samuel Ajayi",
      email: "Sam@byro.africa",
      role: "Event manager",
    },
  ]);

  const handleAddHost = () => {
    if (newHostName && newHostEmail) {
      const newHost = {
        id: hosts.length + 1,
        name: newHostName,
        email: newHostEmail,
        role: "Host",
      };
      setHosts([...hosts, newHost]);
      setNewHostName("");
      setNewHostEmail("");
      setShowAddHost(false);
    }
  };

  const handleRemoveHost = (hostId) => {
    setHosts(hosts.filter((host) => host.id !== hostId));
  };

  return (
    <>
      {event ? (
        <div>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 ">
            <div>
              <div className="w-full lg:w-auto">
                <img
                  src={event.event_image}
                  alt={event.name}
                  className="w-full lg:w-[387px] h-[200px] lg:h-[244px] object-cover rounded-lg"
                />
              </div>
              <div className=" mx-auto justify-center">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 transition-colors mx-auto mt-4"
                >
                  <Link className="w-5 h-5" />
                  <span className="font-medium">
                    {copySuccess ? "Link Copied!" : "Copy Event Link"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <div className="bg-[#007AFF26] rounded-xl p-4 lg:p-5 w-full lg:w-[387px] lg:h-[244px] flex flex-col justify-center">
                <div className="flex items-start mb-4">
                  <span className="mt-1 flex-shrink-0">
                    <Image
                      src={Schedule}
                      alt="Schedule Icon"
                      width={40}
                      height={40}
                      className="w-8 h-8 lg:w-[60px] lg:h-[60px]"
                    />
                  </span>
                  <div className="ml-3 lg:ml-2 flex-1">
                    <p className="text-base lg:text-lg font-semibold text-black">
                      {event.day}
                    </p>
                    <p className="text-sm lg:text-base text-black">
                      {event.time_from} to {event.time_to} ({event.timezone})
                    </p>
                  </div>
                </div>

                {/* Location Section */}
                <div className="flex items-start">
                  <span className="mt-1 flex-shrink-0">
                    <Image
                      src={Location}
                      alt="Location Icon"
                      width={40}
                      height={40}
                      className="w-8 h-8 lg:w-[60px] lg:h-[60px]"
                    />
                  </span>
                  <div className="ml-3 lg:ml-2 flex-1">
                    <p className="text-base lg:text-lg font-semibold text-black">
                      {event.location || "Virtual Event"}
                    </p>
                    {event.virtual_link && (
                      <a
                        href={event.virtual_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm lg:text-base"
                      >
                        Join Virtual Event
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <button className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 transition-colors mx-auto mt-4">
                  <Edit3 className="w-5 h-5" />
                  <span className="font-medium">Edit Event</span>
                </button>
              </div>
            </div>

          
          </div>
            {/* Host Management */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Host</h3>
                <button
                  onClick={() => setShowAddHost(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Host</span>
                </button>
              </div>

              <p className="text-gray-500 text-sm mb-6">
                Add, Host, Event Manager
              </p>

              <div className="space-y-4">
                {hosts.map((host) => (
                  <div
                    key={host.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {host.name}
                      </div>
                      <div className="text-sm text-gray-500">{host.email}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-blue-600 font-medium">
                        {host.role}
                      </span>
                      {host.role !== "Creator" && (
                        <button
                          onClick={() => handleRemoveHost(host.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
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
      ) : null}
    </>
  );
}
