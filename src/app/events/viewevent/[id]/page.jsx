"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Transfer, Schedule, Location, nft } from "../../../assets/index";
import Image from "next/image";
import { Ticket } from "lucide-react";
import RegisterModal from "../../../../components/auth/RegisterModal";
import API from "../../../../services/api";
import { toast } from "react-toastify";

const ViewEvent = () => {
  const { id } = useParams();
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
  console.log("Event ID:", id);
  console.log("Event Data:", useParams());

  // Memoize handlers
  const handleOpen = useCallback(() => setShowRegisterModal(true), []);

  const handleClose = useCallback(() => {
    setShowRegisterModal(false);
    if (window.location.pathname.includes(`/events/${id}/register`)) {
      router.replace(`/events/${id}`);
    }
  }, [id, router]);

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
    if (!id) {
      setError("No event ID provided");
      setLoading(false);
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.location.pathname.includes(`/events/${id}/register`)
    ) {
      setShowRegisterModal(true);
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await API.getEvent(id);
        if (eventData?.id) {
          setEvent(eventData);
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
  }, [id]);

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

  return (
    <div className="relative">
      <div className=" inset-0 bg-main-section bg-fixed bg-cover bg-center bg-no-repeat min-h-screen z-0">
        
        <main className="mx-auto p-4 md:p-6 lg:p-10 w-full lg:w-[80%] xl:w-[70%] 2xl:w-[60%]">
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-14 justify-center items-start">
            {/* Left column */}
            <div className="w-full md:w-auto">
              {/* Event image */}
              <div className="w-full h-52 md:w-52 md:h-52 rounded-lg overflow-hidden mx-auto md:mx-0">
                {event.event_image ? (
                  <img
                    src={event.event_image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex flex-col items-center justify-center">
                    <svg
                      className="h-12 w-12 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="text-white text-xs text-center mt-1">
                      <div>Event</div>
                      <div>Image</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hosted by section */}
              <div className="mt-6 mb-6">
                <div className="font-bold text-black text-xl mb-1">
                  Hosted by
                </div>
                <div className="font-medium text-black text-sm mb-1">
                  Byro office (Host not specified)
                </div>
                {!registered && (
                  <div className="text-sm text-gray-600 mb-2">
                    Is ticket transferable? {event.transferable ? "Yes" : "No"}
                  </div>
                )}
                {registered && event.transferable && (
                  <div>
                    <button
                      onClick={handleTransferClick}
                      className="flex items-center text-blue-500 text-sm"
                    >
                      <Image
                        src={Transfer}
                        alt="Transfer Icon"
                        width={24}
                        height={24}
                        className="mr-1"
                      />
                      Transfer Ticket
                    </button>
                    {showTransferInput && (
                      <form onSubmit={handleTransferSubmit} className="mt-2">
                        <div className="flex flex-col space-y-2">
                          <label
                            htmlFor="name"
                            className="text-sm text-gray-600"
                          >
                            Recipient's Name:
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={transferName}
                            onChange={(e) => setTransferName(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm"
                            placeholder="John Doe"
                            required
                          />
                          <label
                            htmlFor="email"
                            className="text-sm text-gray-600"
                          >
                            Recipient's Email:
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={transferEmail}
                            onChange={(e) => setTransferEmail(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm"
                            placeholder="example@email.com"
                            required
                          />
                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              className="bg-blue-500 text-white px-4 py-1 rounded text-sm"
                            >
                              Send
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowTransferInput(false)}
                              className="bg-gray-300 text-gray-700 px-4 py-1 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Price section */}
              <div className="flex items-center mb-6 bg-gray-50 border-2 rounded-lg w-full max-w-xs">
                <Ticket className="bg-blue-500 mx-3 transform -rotate-12" />
                <div className="py-2">
                  <div className="font-bold text-black text-xl">
                    {parseFloat(event.ticket_price) === 0
                      ? "Free"
                      : `$${event.ticket_price}`}
                  </div>
                  <div className="text-xs text-black">USDC ON BASE</div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="w-full md:w-[50%] space-y-4 mt-4 md:mt-0">
              {/* Event name */}
              <div className="bg-gray-50 border-2 rounded-lg w-full">
                <h1 className="text-xl font-semibold text-[#2653EB] p-5 text-center md:text-left">
                  {event.name}
                </h1>
              </div>

              {/* Date and time */}
              <div className="flex items-start">
                <span className="mt-1">
                  <Image
                    src={Schedule}
                    alt="Schedule Icon"
                    width={24}
                    height={24}
                  />
                </span>
                <div className="ml-2">
                  <p className="text-lg font-semibold text-black">
                    {formattedDate}
                  </p>
                  <p className="text-black">
                    {event.time_from} to {event.time_to} ({event.timezone})
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start">
                <span className="mt-1">
                  <Image
                    src={Location}
                    alt="Location Icon"
                    width={24}
                    height={24}
                  />
                </span>
                <div className="ml-2">
                  <p className="text-lg font-semibold text-black">
                    {event.location || "Virtual Event"}
                  </p>
                  {event.virtual_link && (
                    <a
                      href={event.virtual_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Join Virtual Event
                    </a>
                  )}
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-start">
                <span className="mt-1">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 8C17 10.2091 15.2091 12 13 12C10.7909 12 9 10.2091 9 8C9 5.79086 10.7909 4 13 4C15.2091 4 17 5.79086 17 8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1 20.5C1 17.6 3.4 14 9 14C14.6 14 17 17.6 17 20.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M19 8H25"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M22 5V11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div className="ml-2">
                  <p className="text-lg font-semibold text-black">Capacity</p>
                  <p className="text-black">
                    {event.capacity ? event.capacity : "Unlimited"}
                  </p>
                </div>
              </div>

              {/* Registration card */}
              <div className="w-full">
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                  {registered ? (
                    <div className="text-center md:text-left">
                      <h3 className="text-lg font-bold mb-1 text-black">
                        You've Registered
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        No longer able to attend? <br />
                        Notify the host by{" "}
                        <button
                          onClick={handleCancelRegistration}
                          className="text-blue-500 underline"
                        >
                          canceling your registration
                        </button>
                        .
                      </p>
                      <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 md:gap-4">
                        <button className="bg-green-500 text-sm text-white py-2 px-6 rounded-full w-full sm:w-auto">
                          View ticket
                        </button>
                        <button className="bg-blue-500 text-sm text-white py-2 px-6 rounded-full flex items-center justify-center w-full sm:w-auto">
                          <Image
                            src={nft}
                            alt="NFT icon"
                            width={20}
                            height={20}
                            className="mr-2"
                          />
                          Mint Byro NFT
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-black mb-2">
                        Registration
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Welcome! To join the event, please register below.
                      </p>
                      <button
                        onClick={handleOpen}
                        className="bg-green-500 text-white py-2 px-6 rounded-lg w-full sm:w-[80%] cursor-pointer"
                      >
                        Register
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About section */}
          <section className="mt-8 p-4 md:p-6">
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
              About Event
            </h3>
            <p className="text-base md:text-xl text-gray-600 leading-relaxed">
              {event.description || "No description available."}
            </p>
          </section>
        </main>
      </div>
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={handleClose}
        onSuccess={handleRegistrationSuccess}
        eventId={id}
      />
    </div>
  );
};

export default ViewEvent;
