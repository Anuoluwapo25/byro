"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Transfer, Schedule, Location, nft } from "../assets/index";
import Image from "next/image";
import { Ticket } from "lucide-react";
import RegisterModal from "../../components/auth/RegisterModal";
import API from '../../services/api';
// import ErrorBoundary from '../components/ErrorBoundary';

const page = () => {
  const [registered, setRegistered] = useState(true);
  const [showTransferInput, setShowTransferInput] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferName, setTransferName] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false); // modal open state

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const router = useRouter();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const response = await API.getEvent(id);
        setEventData(response.data);
      } catch (error) {
        console.error("Failed to load event:", error);
        // Add error state handling here
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Loading event details...</div>;
  }

  if (!eventData) {
    return <div className="text-center py-10">Event not found</div>;
  }

  const handleTransferClick = () => {
    setShowTransferInput(!showTransferInput);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    // Handle the transfer logic here
    alert(`Ticket transfer request sent to ${transferName} (${transferEmail})`);
    setShowTransferInput(false);
    setTransferEmail("");
    setTransferName("");
  };

  const handleRegister = () => {
    setShowRegisterModal(true);
  };

  const handleRegistrationSuccess = () => {
    setShowRegisterModal(false);
    setRegistered(true);
  };

  const handleCancelRegistration = () => {
    setRegistered(false);
  };

  return (
    <div>
      <div className="relative bg-main-section bg-fixed bg-cover bg-center bg-no-repeat h-screen">
        {/* <Navbar /> */}
        <main className="mx-auto p-4 md:p-6 lg:p-10 w-full lg:w-[80%] xl:w-[70%] 2xl:w-[60%]">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-14 justify-center items-start">
            {/* Left column */}
            <div className="w-full md:w-auto">
              {/* Event image */}
              <div className="w-full h-52 md:w-52 md:h-52 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto md:mx-0">
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

              {/* Hosted by section */}
              <div className="mt-6 mb-6">
                <div className="font-bold text-black text-xl mb-1">
                  Hosted by
                </div>
                <div className="font-medium text-black text-sm mb-1">
                  {eventData.host || "Byro office"}
                </div>
                {!registered && (
                  <div className="text-sm text-gray-600 mb-2">
                    Is ticket transferable?
                  </div>
                )}
                {registered && (
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

                    {/* Email Input for Ticket Transfer */}
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
                    ${eventData.ticket_price || "100"}
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
                  {eventData.name || "Event Name"}
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
                    {formatDate(eventData.day) || "Tuesday, 28th April 2025"}
                  </p>
                  <p className="text-black">
                    {eventData.time_from} to {eventData.time_to}
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
                    {eventData.location || "Byro Headquarters"}
                  </p>
                  <p className="text-black">
                    {eventData.city || "Lagos, Nigeria"}
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
              {eventData.description || "No description available."}
            </p>
          </section>
        </main>
        {/* <Footer /> */}
      </div>
      <RegisterModal isOpen={isOpen} onClose={handleClose} />
    </div>
  );
};

const formatDate = (dateString) => {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

export default page;
