import React from "react";
import Image from "next/image";
import { Sparkle } from "../app/assets/index";


const HeroPage = () => {
  return (
    <main className="bg-white pt-8 sm:pt-12 position: relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 text-center space-y-4 sm:space-y-6">
        <div className="relative w-fit mx-auto">
          <div className="absolute inset-0 z-0 rounded-full rainbow-border"></div>

          <div className="relative z-10 flex items-center space-x-1.5 sm:space-x-2 bg-[#F2F8FF] rounded-full px-2.5 py-1.5 sm:p-3 w-full sm:w-auto">
            <Image
              src={Sparkle}
              alt="sparkle"
              className="w-[16px] h-[16px] sm:w-[24px] sm:h-[24px] flex-shrink-0"
              priority
            />
            <p className="text-[#444444] text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium leading-[140%]">
              Trusted by event Vendors around the world.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl sm:text-lg md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[120%] sm:leading-[140%] text-[#1E1E1E]">
            Turn moments into events worth remembering.
          </h1>
        </div>

        <div className="max-w-3xl mx-auto px-4">
          <p className="font-medium text-base sm:text-lg md:text-xl lg:text-2xl text-[#444444] leading-[140%]">
            Set up your event page, customize ticket options, and keep track of
            every guest, all in one place and in record time.
          </p>
        </div>

        <div className="pt-2 sm:pt-4">
          <button aria-label="Get Started" className="bg-[#1F6BFF] text-white py-2.5 sm:py-3 px-6 sm:px-8 rounded-full font-medium text-base sm:text-lg hover:bg-blue-700 transition-colors">
            Create an account
          </button>
        </div>
      </div>
    </main>
  );
};

export default HeroPage;
