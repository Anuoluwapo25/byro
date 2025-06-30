"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Link,
  Edit3,
  Trash2,
  Plus,
  Copy,
  ExternalLink,
} from "lucide-react";
import Navbar from "../../../components/Navbar";
// import { eventIcon } from "../../../app/assets/index";
import DashboardTab from "@/components/DashboardTab";

export default function EventDashboard({ params }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddHost, setShowAddHost] = useState(false);
  const [newHostEmail, setNewHostEmail] = useState("");
  const [newHostName, setNewHostName] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Mock event data - in real app, this would come from your database
  const [eventData, setEventData] = useState({
    id: "default-slug",
    title: "BYRO LAUNCH",
    date: "Tuesday, 28th April 2025",
    time: "2:00 PM to 4:00 PM",
    location: "Byro Headquarters",
    city: "Lagos, Nigeria",
    description: "Official launch event for Byro platform",
    image: "/api/placeholder/400/300", // You'll replace this with actual image
  });

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

  // Update eventData when params become available
  useEffect(() => {
    if (params?.slug) {
      setEventData(prev => ({
        ...prev,
        id: params.slug
      }));
    }
  }, [params?.slug]);

  const handleCopyLink = async () => {
    const eventLink = `${window.location.origin}/events/${eventData.id}`;
    try {
      await navigator.clipboard.writeText(eventLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

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

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "attendees", label: "Attendees" },
    { id: "confirmation", label: "Confirmation" },
    { id: "reminder", label: "Reminder" },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background image and overlay */}
      <div className="absolute inset-0 bg-main-section bg-fixed bg-cover bg-center bg-no-repeat z-0" />
      <div className="absolute inset-0 bg-gray-50 z-0 opacity-70" />
      <div className="relative">
        <Navbar />

        <main className="bg-white w-[60%] mx-auto rounded-lg mt-10">
          <div className="width-[50%]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-10 py-5">
                    <h1 className="text-2xl font-bold text-[#007AFF]">
                      {eventData.title}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="bg-blue-50 text-[#007AFF] px-4 py-2 rounded-2xl border-none hover:bg-blue-100 transition-colors flex items-center space-x-2">
                    {/* <eventIcon className="w-4 h-4 text-[#007AFF]"/> */}

                    <Calendar className="w-4 h-4" />
                    <span>Event Page</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <DashboardTab />
          </div>
        </main>
      </div>
    </div>
  );
}
