"use client";
import API from "../../../services/api";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { eventIcon } from "../../assets";
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
import Payout from "./Payout";
import Attendees from "./Attendees";
import Confirmation from "./Confirmation";
import Reminder from "./Reminder";
import Image from "next/image";
import { Providers } from "@/redux/Providers";

export default function EventDashboard() {
  const params = useParams();
  const { slug } = params;
  const [activeTab, setActiveTab] = useState("overview");
  const [copySuccess, setCopySuccess] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [event, setEvent] = useState(null);
  const [activePage, setActivePage] = useState("overview");

  const router = useRouter();

  let content;
  if (activePage === "overview") {
    content = <EventDetails />;
  } else if (activePage === "attendees") {
    content = <Attendees />;
  } else if (activePage === "confirmation") {
    content = <Confirmation />;
  } else if (activePage === "reminder") {
    content = <Reminder />;
  } else if (activePage === "payout") {
    content = <Payout />;
  }

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

  return (
    <Providers>
      <div className="relative min-h-screen bg-white">
        {/* Content wrapper with proper z-index */}
        <div className="relative z-10">
          <Navbar />

          {/* Main container - centered with proper spacing */}
          <div className="min-h-screen flex flex-col items-center pt-4 sm:pt-6 lg:pt-8 pb-8">
            <main className="bg-white w-full sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%] max-w-7xl rounded-lg p-3 sm:p-4 lg:p-6 shadow-lg">
              {/* Header Section */}
              <div className="w-full mb-4">
                <div className="max-w-full mx-auto">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4 sm:gap-0">
                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-5 w-full sm:w-auto">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#007AFF] text-center sm:text-left">
                          {event ? event.name : "BYRO LAUNCH"}
                        </h1>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-center sm:justify-end">
                      <button className="bg-blue-50 text-[#007AFF] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border-none hover:bg-blue-100 transition-colors flex items-center space-x-3 text-sm sm:text-base lg:text-lg">
                        <span>Edit Event</span>
                      </button>
                      <button
                        onClick={handleViewEvent}
                        className="bg-blue-50 text-[#007AFF] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border-none hover:bg-blue-100 transition-colors flex items-center space-x-3 text-sm sm:text-base lg:text-lg"
                      >
                        <span>Event Page</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Tabs */}
              <div className="mb-6 w-full">
                <DashboardTab onNavigate={setActivePage} active={activePage} />
              </div>

              {/* Event Details Section */}
              <div>{content}</div>
            </main>
          </div>
        </div>
      </div>
    </Providers>
  );
}
