"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ManSeating } from "../app/assets/index";
import Stats from "./Stats";

const NewHeroPage = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email submitted:", email);
  };

  return (
    <main className="">
    <div className="relative bg-main-section bg-fixed bg-cover bg-center bg-no-repeat  flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/70 to-pink-100/70 z-0 overflow-hidden" />
  
      {/* Shared container with max width */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4">
        {/* Hero Section */}
        <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Text Section */}
          <div className="md:w-1/2 space-y-6 text-center md:text-left">
            <h1 className="text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] font-bold leading-tight">
              <span className="bg-gradient-to-r from-[#0057FF] to-[#4F8BFF] text-transparent bg-clip-text block">
                One Platform
              </span>
              <span className="text-[#0B243F] block">Endless Events</span>
            </h1>
  
            <p className="text-lg sm:text-xl bg-gradient-to-r from-[#0057FF] to-[#4F8BFF] text-transparent bg-clip-text">
              Create your event page, invite friends, and start selling
              tickets. Host an unforgettable event today!
            </p>
  
            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row sm:py-5 md:py-8 gap-3 items-center"
            >
              <input
                type="email"
                placeholder="Email Address..."
                className="flex-grow border border-[#B7E9D5] bg-[#E8F8F2] px-4 py-3 rounded-full placeholder:text-[#16B979]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-[#16B979] px-8 py-4 text-base text-white rounded-full w-full sm:w-auto"
              >
                Get Started
              </button>
            </form>
          </div>
  
          {/* Image Section */}
          <div className="hidden md:flex md:w-1/2 justify-center">
            <Image
              src={ManSeating}
              alt="Man Seating"
              width={805}
              height={705}
              className="w-[805px] h-[705px]"
              priority
            />
          </div>
        </section>
      </div>
    </div>
  
    <Stats />
  </main>
  
  );
};

export default NewHeroPage;
