"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Transfer, Schedule, Location, nft, schedule } from "../assets/index";
import Image from "next/image";
import { ChevronLeft, Calendar, MapPin, Users, Ticket } from "lucide-react";
import RegisterModal from "../../components/auth/RegisterModal";
import API from "../../services/api";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { TbArrowBackUp } from "react-icons/tb";
import { Providers } from "@/redux/Providers";

const ViewEvent = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [registered, setRegistered] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [showTransferInput, setShowTransferInput] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferName, setTransferName] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  console.log("Event Data:", useParams());

  // Get image URL with fallback
  const getImageUrl = () => {
    if (!event.event_image || imageError) {
      return "/assets/images/default-event.jpg";
    }

    // If it's already a full URL
    if (event.event_image.startsWith("http")) {
      return event.event_image;
    }

    // If it's a relative path from your API
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL || "https://byro.onrender.com";
    return `${baseURL}${event.event_image}`;
  };

  // Memoize handlers
  const handleOpen = useCallback(() => setShowRegisterModal(true), []);

  const handleClose = useCallback(() => {
    setShowRegisterModal(false);
    if (window.location.pathname.includes(`/events/${slug}/register`)) {
      router.replace(`/events/${slug}`);
    }
  }, [slug, router]);

  const handleTransferClick = useCallback(() => {
    if (!event?.transferable) {
      toast.error("Tickets for this event are not transferable");
      return;
    }
    if (!ticketId) {
      toast.error("No ticket found for transfer");
      return;
    }
    setShowTransferInput((prev) => !prev);
  }, [event?.transferable, ticketId]);

  const handleTransferSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await API.transferTicket(ticketId, {
          to_user_name: transferName,
          to_user_email: transferEmail,
        });
        toast.success(
          `Ticket transfer request sent to ${transferName} (${transferEmail})`
        );
        setShowTransferInput(false);
        setTransferEmail("");
        setTransferName("");
      } catch (err) {
        console.error("Error transferring ticket:", err);
        toast.error(err.message || "Failed to transfer ticket");
      }
    },
    [ticketId, transferName, transferEmail]
  );

  const handleRegister = useCallback(() => {
    setShowRegisterModal(true);
  }, []);

  const handleRegistrationSuccess = useCallback((ticketId) => {
    setShowRegisterModal(false);
    setRegistered(true);
    setTicketId(ticketId);
    toast.success("Successfully registered for the event!");
  }, []);

  const handleCancelRegistration = useCallback(async () => {
    if (!ticketId) {
      toast.error("No ticket found for cancellation");
      return;
    }
    try {
      await API.cancelRegistration(ticketId);
      setRegistered(false);
      setTicketId(null);
      toast.success("Registration canceled successfully");
    } catch (err) {
      console.error("Error canceling registration:", err);
      toast.error(err.message || "Failed to cancel registration");
    }
  }, [ticketId]);

  // Memoize formatted date
  const formattedDate = useMemo(() => {
    if (!event?.day) return "";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(event.day).toLocaleDateString("en-US", options);
  }, [event?.day]);

  // Fetch event data
  useEffect(() => {
    if (!slug) {
      setError("No event slug provided");
      setLoading(false);
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.location.pathname.includes(`/events/${slug}/register`)
    ) {
      setShowRegisterModal(true);
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await API.getEvent(slug);
        if (eventData?.id || eventData?.slug) {
          setEvent(eventData);
          if (eventData.slug && eventData.slug !== slug) {
            router.replace(`/${eventData.slug}`);
          }
          if (window.location.search.includes("preview=true")) {
            toast.success("Event created successfully! Here's your preview.");
          }
        } else {
          throw new Error("Invalid event data received from server");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err.message || "Failed to fetch event");
        if (err.message.includes("404")) {
          setError(
            "Event not found. It may not exist or you lack permission to view it."
          );
        }
        toast.error(err.message || "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug, router]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 p-8">
        <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => router.push("/events")}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          aria-label="Return to events list"
        >
          Back to Events
        </button>
      </div>
    );

  if (!event) return null;

  return (
    <Providers>
      <div className="relative min-h-screen bg-white">
        <Navbar />

        {/* Header */}
        <div className=" mt-6">
          <div className="max-w-[90%] mx-auto p-4">
            <div className="flex items-center">
              <TbArrowBackUp
                className="w-5 h-5 text-gray-600 mr-3 cursor-pointer"
                onClick={() => router.back()}
              />
              <span
                className="text-gray-600 text-sm cursor-pointer"
                onClick={() => router.back()}
              >
                Back
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[90%] mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Event Title */}
              <div className=" rounded-lg p-1">
                <div className="rounded-[20px] px-6 py-4 border border-[#8E8E93]">
                  <h1 className="text-[#007AFF] font-semibold text-[27px]">
                    {event.name}
                  </h1>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="flex items-center text-red-600 text-sm">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <Image src={schedule} alt="schedule" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{formattedDate}</span>
                    <div className="text-gray-600 text-sm">
                      {event.time_from &&
                        new Date(
                          `1970-01-01T${event.time_from}`
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}{" "}
                      to{" "}
                      {event.time_to &&
                        new Date(
                          `1970-01-01T${event.time_to}`
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}{" "}
                      {/* {event.timezone && `(${event.timezone})`} */}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-gray-700 text-sm">
                  <div className="w-8 h-8 flex items-center justify-center mr-3">
                    <Image src={Location} alt="location" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {event.location || "Byro Headquarters"}
                    </div>
                    <div className="text-gray-500 text-xs">Lagos, Nigeria</div>
                  </div>
                </div>

                {/* Registration Status */}
                {registered ? (
                  <div className="mt-6 space-y-3 rounded-[18px] shadow-md bg-white p-[20px] w-fit">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        You've Registered
                      </h3>
                      <div className="text-xs text-gray-500">
                        Check in status:{" "}
                        <span className="text-green-600 font-medium">
                          Approved
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        No longer able to attend?{" "}
                        <button
                          onClick={handleCancelRegistration}
                          className="text-blue-600 underline"
                        >
                          cancel registration
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        className=" text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
                        style={{
                          background:
                            "linear-gradient(90deg, #63D0A5 0%, #16B979 100%)",
                        }}
                      >
                        View ticket
                      </button>
                      <button className="bg-[#007AFF] hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center transition-colors">
                        <Image
                          src={nft}
                          alt="NFT icon"
                          width={16}
                          height={16}
                          className="mr-2"
                        />
                        Mint Byro NFT
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3 rounded-[18px] shadow-md bg-white p-[20px] w-fit">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Registration
                      </h3>
                      <div className="text-xs text-gray-500">
                        To join the event, please click register
                      </div>
                    </div>

                    <button
                      onClick={handleOpen}
                      className="text-white px-8 py-3 rounded-full text-sm font-medium transition-colors bg-gradient-to-r"
                      style={{
                        background:
                          "linear-gradient(90deg, #63D0A5 0%, #16B979 100%)",
                      }}
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Event Image */}
              <div className="bg-white rounded-lg overflow-hidden">
                {event.event_image ? (
                  <img
                    src={getImageUrl()}
                    alt={event.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div
                    className="h-48 bg-cover bg-center relative"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect fill="%23111827" width="100%" height="100%"/><g transform="translate(100,100)"><circle cx="50" cy="50" r="20" fill="%23f59e0b" opacity="0.7"/><circle cx="150" cy="80" r="15" fill="%23f59e0b" opacity="0.5"/><circle cx="250" cy="60" r="18" fill="%23f59e0b" opacity="0.6"/><circle cx="350" cy="90" r="12" fill="%23f59e0b" opacity="0.4"/><circle cx="450" cy="70" r="16" fill="%23f59e0b" opacity="0.8"/><circle cx="550" cy="85" r="14" fill="%23f59e0b" opacity="0.5"/></g><g transform="translate(50,200)"><rect x="20" y="20" width="30" height="60" rx="15" fill="%23e5e7eb" opacity="0.9"/><rect x="80" y="10" width="30" height="70" rx="15" fill="%23e5e7eb" opacity="0.8"/><rect x="140" y="25" width="30" height="55" rx="15" fill="%23e5e7eb" opacity="0.9"/><rect x="200" y="15" width="30" height="65" rx="15" fill="%23e5e7eb" opacity="0.7"/><rect x="260" y="30" width="30" height="50" rx="15" fill="%23e5e7eb" opacity="0.8"/><rect x="320" y="20" width="30" height="60" rx="15" fill="%23e5e7eb" opacity="0.9"/><rect x="380" y="25" width="30" height="55" rx="15" fill="%23e5e7eb" opacity="0.8"/><rect x="440" y="10" width="30" height="70" rx="15" fill="%23e5e7eb" opacity="0.7"/><rect x="500" y="20" width="30" height="60" rx="15" fill="%23e5e7eb" opacity="0.9"/><rect x="560" y="15" width="30" height="65" rx="15" fill="%23e5e7eb" opacity="0.8"/><rect x="620" y="25" width="30" height="55" rx="15" fill="%23e5e7eb" opacity="0.9"/></g></svg>')`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                )}
              </div>

              {/* Event Info Card */}
              <div className="bg-white flex gap-6 rounded-lg p-6 space-y-4">
                <div>
                  {" "}
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">
                      Hosted by
                    </h3>
                    <div className="text-sm text-gray-600">Byro africa</div>
                  </div>
                  {!registered && (
                    <div className="pt-2">
                      <div className="text-sm font-medium text-gray-800 mb-1">
                        Is ticket transferrable?
                      </div>
                      <div className="text-sm text-gray-600">
                        {event.transferable ? "Yes" : "No"}
                      </div>
                    </div>
                  )}
                  {registered && event.transferable && (
                    <div>
                      <button
                        onClick={handleTransferClick}
                        className="flex items-center text-blue-600 text-sm"
                      >
                        <Image
                          src={Transfer}
                          alt="Transfer Icon"
                          width={16}
                          height={16}
                          className="mr-2"
                        />
                        <span className="underline cursor-pointer">
                          Transfer Ticket
                        </span>
                      </button>
                      {showTransferInput && (
                        <form
                          onSubmit={handleTransferSubmit}
                          className="mt-4 space-y-3"
                        >
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Recipient's Name:
                            </label>
                            <input
                              type="text"
                              id="name"
                              value={transferName}
                              onChange={(e) => setTransferName(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Recipient's Email:
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={transferEmail}
                              onChange={(e) => setTransferEmail(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="example@email.com"
                              required
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                              Send
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowTransferInput(false)}
                              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                  {/* Capacity Info */}
                  {event.capacity && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-800 mb-1">
                        Capacity
                      </div>
                      <div className="text-sm text-gray-600">
                        {event.capacity}
                      </div>
                    </div>
                  )}
                  {/* Virtual Link */}
                  {event.virtual_link && (
                    <div className="pt-2">
                      <a
                        href={event.virtual_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Join Virtual Event
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 transform rotate-12">
                      <Ticket className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-xl text-gray-800">
                        {parseFloat(event.ticket_price) === 0
                          ? "Free"
                          : `$${event.ticket_price}`}
                      </div>
                      <div className="text-xs text-gray-500">USDC ON BASE</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* About Event */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="font-bold text-gray-800 text-xl mb-4">
              About Event
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {event.description ||
                "Lorem ipsum dolor sit amet consectetur. Sit elementum enim fermentum at tristique luctus vulputate tellus felis. Rhoncus amet commodo sit aliquam pretium. Sed lacus sed adipiscing sit magna mus eros sit. Lacus molestie in vivamus metus tincidunt. Sem diam neque amet gravida quis. At gravida diam sit lobortis purus sit nullam venenatis. Urna parturient quam integer consectetur in lacus nec. Purus vitae in tellus sit nulla nibh magna. Lacinia semper urna mi cursus libero malesuada eu sit."}
            </p>
          </div>
        </div>

        <RegisterModal
          isOpen={showRegisterModal}
          onClose={handleClose}
          onSuccess={handleRegistrationSuccess}
          eventSlug={slug}
        />
      </div>
    </Providers>
  );
};

export default ViewEvent;
