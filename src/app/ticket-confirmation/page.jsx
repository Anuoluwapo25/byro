"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { introduce } from "../../app/assets/index";


function TicketConfirmationContent() {
  const searchParams = useSearchParams();
  const [ticketData, setTicketData] = useState(null);

 

  useEffect(() => {
    // Get ticket data from localStorage
    const storedData = localStorage.getItem("ticketData");
    if (storedData) {
      setTicketData(JSON.parse(storedData));
      // Clear the data from localStorage after retrieving it
      localStorage.removeItem("ticketData");
    }
  }, []);

  if (!ticketData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-2xl lg:max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden px-4 sm:px-8 lg:px-20">
          <div className="px-4 sm:px-6 py-6 sm:py-8 mx-auto">
            <Image
              src={introduce}
              alt="Sucessful"
              width={120}
              height={120}
              className="max-w-full h-auto object-contain drop-shadow-2xl items-center mx-auto sm:w-[180px] sm:h-[180px]"
              priority
            />
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 text-center">
                  Your Ticket is Booked!
                </h3>
                <div className="mt-2 sm:mt-4 text-gray-600 text-center text-sm sm:text-base">
                  <p>
                    Thank you,{" "}
                    <span className="font-bold">{ticketData.attendeeName}</span>
                  </p>
                  <p>
                    Your ticket for{" "}
                    <span className="font-bold">{ticketData.eventName}</span> on{" "}
                    <span className="font-bold">{ticketData.eventDate},</span>{" "}
                    <span className="font-bold">{ticketData.timeFrom} </span>
                    has been successfully booked.
                  </p>
                </div>
              </div>

              {/* <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Ticket Information
                </h3>
                <div className="mt-2 text-gray-600">
                  <p>Ticket ID: {ticketData.ticketId}</p>
                  <p>Attendee: {ticketData.attendeeName}</p>
                  <p>Email: {ticketData.attendeeEmail}</p>
                </div>
              </div> */}

              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  What's Next?
                </h3>
                <div className="mt-2 text-gray-600 text-sm sm:text-base">
                  <p>
                    We've sent a confirmation email to{" "}
                    {ticketData.attendeeEmail}
                  </p>
                  <p>Please check your inbox for your ticket.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex justify-center text-white items-center px-4 sm:px-6 py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-xl bg-[#34C759] hover:bg-[#71b983] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16B979]"
              >
                Download Ticket
              </button>
              <Link
                href="/"
                className="flex-1 inline-flex justify-center items-center px-4 sm:px-6 py-3 border-2 text-sm sm:text-base font-medium rounded-xl text-black bg-white hover:bg-[#d6e8e1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16B979]"
              >
                Add to Calendar
              </Link>
            </div>
          </div>
        </div>
        <Link
          href="/"
          className="flex-1 inline-flex justify-center py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-black underline text-center items-center mx-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16B979]"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function TicketConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <TicketConfirmationContent />
    </Suspense>
  );
}
