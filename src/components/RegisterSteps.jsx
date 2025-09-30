import React from "react";
import Image from "next/image";
import eventSetup from '../app/assets/images/event-setup.png';
import manageEvent from "../app/assets/images/manage-event.png"

const RegisterSteps = () => {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-4 p-4">
          {/* Step 1 - 608px × 646px */}
          <div className="bg-[#E3F2FD] p-10 rounded-2xl w-full lg:w-[608px] lg:h-[646px] flex flex-col justify-center">
            <p className="text-[#007AFF] font-extrabold text-xs">STEP 1</p>
            <h1 className="font-semibold text-xl sm:text-2xl text-[#1E1E1E] mt-2">
              Create an account
            </h1>
            <p className="font-medium text-sm sm:text-base text-[#444444] mt-2 max-w-[260px]"> 
              Create an account very easily so you can start creating events.
            </p>
          </div>

          {/* Steps 2 & 3 - 609px × 311px each */}
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <div className="bg-[#FFEBEE] p-6 lg:p-8 rounded-2xl w-full lg:w-[609px] lg:h-[311px] flex flex-col justify-between">
              <div>
                <p className="text-[#007AFF] font-extrabold text-xs">STEP 2</p>
                <h1 className="font-semibold text-lg lg:text-xl text-[#1E1E1E] mt-2">
                  Create an event and sell tickets
                </h1>
                <p className="font-medium text-sm text-[#444444] mt-2">
                  Set up your event in minutes and start selling tickets instantly.
                </p>
              </div>
              <div className="mt-4 relative w-full h-32 lg:h-24 overflow-hidden rounded-lg">
                <Image
                  src={eventSetup}
                  alt="Event Setup"
                  fill
                  className="object-cover object-bottom"
                />
              </div>
            </div>

            <div className="bg-[#FFFDE7] p-6 lg:p-8 rounded-2xl w-full lg:w-[609px] lg:h-[311px] flex flex-col justify-center">
              <div>
              <p className="text-[#007AFF] font-extrabold text-xs">STEP 3</p>
              <h1 className="font-semibold text-lg lg:text-xl text-[#1E1E1E] mt-2">
                Track and manage your event
              </h1>
              <p className="font-medium text-sm text-[#444444] mt-2">
                Use real-time insights to keep your event running smoothly.
              </p>
              </div>
                <div className="mt-4 relative w-full h-32 lg:h-24 overflow-hidden rounded-lg">
                <Image
                  src={manageEvent}
                  alt="Event Setup"
                  fill
                  className="object-cover object-bottom"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSteps;
