import React from "react";
import Image from "next/image";
import { Sparkle } from "../app/assets/index";


const HeroPage = () => {
  return (
    <main className="bg-white  pt-12 position: relative">
      <div className="container mx-auto p-10 text-center space-y-6">


        <div className="relative w-fit mx-auto">

          <div className="absolute inset-0 z-0 rounded-full rainbow-border"></div>

          <div className="relative z-10 flex items-center space-x-2 bg-[#F2F8FF] rounded-full p-3">
            <Image
              src={Sparkle}
              alt="sparkle"
              className="w-[24px] h-[24px]"
              priority
            />
            <p className="text-[#444444] text-2xl font-medium leading-[140%]">
              Trusted by event Vendors around the world.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-7xl font-bold leading-[140%] text-[#1E1E1E]">Turn moments into events worth remembering.</h1>
        </div>

        <div className="max-w-3xl mx-auto">
          <p className="font-medium text-2xl text-[#444444] leading-[140%]">
            Set up your event page, customize ticket options, and keep track of
            every guest, all in one place and in record time.
          </p>
        </div>

        <div>
          <button aria-label="Get Started" className="bg-[#1F6BFF] text-white py-2 px-4 rounded-full font-medium text-lg">Create an account</button>
        </div>
      </div>
    </main>
  );
};

export default HeroPage;
