"use client";
import API from "../../../services/api";
import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { eventIcon } from "../../../app/assets";
import Image from "next/image";
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
import DashboardTab from "@/components/DashboardTab";
import EventDetails from "./EventDetails";

export default function EventDashboard({ params }) {
  const { slug } = use(params);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddHost, setShowAddHost] = useState(false);
  const [newHostEmail, setNewHostEmail] = useState("");
  const [newHostName, setNewHostName] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [event, setEvent] = useState(null);

  const router = useRouter();

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

  const handleViewEvent = async () => {
    const viewEventLink = `${window.location.origin}/${event?.slug}`;
    try {
      window.open(viewEventLink, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Error opening event in new window:", err);
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

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "attendees", label: "Attendees" },
    { id: "confirmation", label: "Confirmation" },
    { id: "reminder", label: "Reminder" },
  ];

  console.log(ticketData);

  return (
    <div className="relative min-h-screen">
      {/* Background image and overlay */}
      <div className="absolute inset-0 bg-main-section bg-fixed bg-cover bg-center bg-no-repeat z-0" />
      <div className="absolute inset-0 bg-gray-50 z-0 opacity-70" />
      <div className="relative">
        <Navbar />

        <main className="bg-white w-full sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%] mx-auto rounded-lg mt-4 sm:mt-6 lg:mt-10 p-4 sm:p-6 lg:p-8">
          {/* Header Section */}
          <div className="w-full">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4 sm:gap-0">
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-5 w-full sm:w-auto">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#007AFF] text-center sm:text-left">
                      {event ? event.name : "Loading..."}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-center sm:justify-end">
                  <button
                    onClick={handleViewEvent}
                    className="bg-blue-50 text-[#007AFF] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border-none hover:bg-blue-100 transition-colors flex items-center space-x-3 text-sm sm:text-base lg:text-lg"
                  >
                    <eventIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Event Page</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <div>
            <DashboardTab />
          </div>

          {/* Event Details Section */}
          <div className="mt-6 sm:mt-8">
            <EventDetails params={params} />
          </div>
        </main>
      </div>
    </div>
  );
}
