import React from "react";
import Image from "next/image";
import eventSetup from "../app/assets/images/event-setup.png";
import manageEvent from "../app/assets/images/manage-event.png";
import signupCard from "../app/assets/images/signup-card.png";

const RegisterSteps = () => {
  return (
    <div className="bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 sm:gap-6 lg:gap-4">
          <div className="bg-[#E3F2FD] p-6 sm:p-8 lg:p-10 rounded-2xl w-full max-w-full lg:w-[608px] lg:h-[646px] min-h-[400px] sm:min-h-[500px] lg:min-h-[646px] flex flex-col justify-between relative overflow-hidden">
            <div className="z-10">
              <p className="text-[#007AFF] font-extrabold text-xs">STEP 1</p>
              <h1 className="font-semibold text-lg sm:text-xl lg:text-2xl text-[#1E1E1E] mt-2">
                Create an account
              </h1>
              <p className="font-medium text-sm sm:text-base text-[#444444] mt-2 max-w-full sm:max-w-[260px]">
                Create an account very easily so you can start creating events.
              </p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-0">
              <Image
                src={signupCard}
                alt="Signup Card"
                className="w-full h-auto object-cover object-bottom"
                width={608}
                height={400}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:gap-6 lg:gap-4 w-full lg:w-auto">
            <div className="bg-[#FFEBEE] p-6 sm:p-7 lg:p-8 rounded-2xl w-full max-w-full lg:w-[609px] lg:h-[311px] min-h-[280px] sm:min-h-[300px] lg:min-h-[311px] flex flex-col justify-between relative overflow-hidden">
              <div className="z-10">
                <p className="text-[#007AFF] font-extrabold text-xs">STEP 2</p>
                <h1 className="font-semibold text-base sm:text-lg lg:text-xl text-[#1E1E1E] mt-2">
                  Create an event and sell tickets
                </h1>
                <p className="font-medium text-sm text-[#444444] mt-2">
                  Set up your event in minutes and start selling tickets
                  instantly.
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-0">
                <Image
                  src={eventSetup}
                  alt="Event Setup"
                  className="w-full h-auto object-cover object-bottom"
                  width={609}
                  height={200}
                />
              </div>
            </div>

            <div className="bg-[#FFFDE7] p-6 sm:p-7 lg:p-8 rounded-2xl w-full max-w-full lg:w-[609px] lg:h-[311px] min-h-[280px] sm:min-h-[300px] lg:min-h-[311px] flex flex-col justify-between relative overflow-hidden">
              <div className="z-10">
                <p className="text-[#007AFF] font-extrabold text-xs">STEP 3</p>
                <h1 className="font-semibold text-base sm:text-lg lg:text-xl text-[#1E1E1E] mt-2">
                  Track and manage your event
                </h1>
                <p className="font-medium text-sm text-[#444444] mt-2">
                  Use real-time insights to keep your event running smoothly.
                </p>
              </div>

              <div className="mt-auto z-0">
                <Image
                  src={manageEvent}
                  alt="Manage Event"
                  className="w-full h-auto object-cover object-bottom"
                  width={609}
                  height={200}
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
