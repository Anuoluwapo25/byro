// components/NewHeroPage.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ManSeating } from "../app/assets/index";
import API from "../services/api";
import { toast } from "sonner";
// import Link from "next/link";

const NewHeroPage = () => {
  const [email, setEmail] = useState("");
  const [waitlist, setWaitlist] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [showCommunityMessage, setShowCommunityMessage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

        if (waitlist.includes(trimmedEmail)) {
      toast.error("This email is already on the waitlist.");
      return;
    }

    if (!trimmedEmail) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const response = await API.joinWaitlist({ email: trimmedEmail });
      if (response) {
        toast.success("Added to waitlist successfully");
        setShowCommunityMessage(true);
        setWaitlist([...waitlist, trimmedEmail]);
        setEmail("");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message === "Email already exists in waitlist."
      ) {
        toast.error("This email is already on the waitlist.");
      } else {
        toast.error(
          error.message || "Failed to join waitlist. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative">
      <div className="absolute inset-0 bg-main-section bg-fixed bg-cover bg-center bg-no-repeat z-0" />

      <div className="absolute inset-0 bg-gray-50 z-0 opacity-70" />

      <div
        className="relative z-10 flex items-center justify-center
                      min-h-screen lg:min-h-[calc(100vh-64px)] 
                      pt-16 lg:pt-0 pb-12 sm:pb-16 lg:pb-0"
      >
        <div className="max-w-7xl mx-auto w-full px-6 md:px-8 lg:px-12 py-12 md:py-20 lg:py-24">
          <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 md:gap-16 lg:gap-20">
            <div className="md:w-1/2 space-y-6 text-center md:text-left">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-[#0057FF] to-[#4F8BFF] text-transparent bg-clip-text block">
                  Create Experience,
                </span>
                <span className="text-[#0B243F] block">Enjoy Memories.</span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl font-normal leading-relaxed mt-4 bg-gradient-to-r from-[#0057FF] to-[#4F8BFF] text-transparent bg-clip-text">
                Create your event page, invite friends, and start selling
                tickets. Host an unforgettable event today!
              </p>

              {!showCommunityMessage ? (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col md:flex-row sm:py-5 md:py-8 gap-3 items-center"
                >
                  <input
                    type="email"
                    placeholder="Email Address..."
                    className="w-full flex-grow border border-[#16B979] bg-[#E8F8F2] px-4 py-3 rounded-full placeholder:text-[#16B979] text-black focus:outline-none focus:text-black "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-[#16B979] px-8 py-4 text-base text-white rounded-full w-full sm:w-auto"
                    disabled={loading}
                  >
                    {loading ? "Joining..." : "Join Waitlist"}
                  </button>
                </form>
              ) : (
                <div className="mt-2 text-center md:text-left rounded">
                  <p className="text-[#16B979] font-bold  text-xl">
                    Join our community and stay updated!
                    <a
                      href="https://chat.whatsapp.com/KiJj4KY6UOxD6fgkcOWKLv"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 underline hover:text-black transition-colors"
                    >
                      Join Now
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div className="hidden md:flex md:w-1/2 justify-center items-center">
              <Image
                src={ManSeating}
                alt="Man Seating"
                width={800}
                height={700}
                className="max-w-full h-auto object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default NewHeroPage;
