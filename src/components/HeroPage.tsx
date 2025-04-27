import React from "react";
import { BusinessManLaunch, ComingSoonTag } from "../app/assets/index";
import Image from "next/image";


const HeroPage = () => {
  return (
    <main className="bg-[#4f8bff]  pt-12 position: relative">
      <div className="container mx-auto p-4 space-y-24">
        <h1 className=" text-3xl font-bold text-white text-transform: uppercase w-[100%] sm:text-5xl sm:w-[40%] md:h-0">
          Next-gen ticketing with crypto
        </h1>
        <div className="flex-col items-center gap-32 md:flex md:flex-row">
          <div className="w-full sm:w-[60%]">
            <p className="text-lg pb-3">
              Seamless, secure, and decentralized event ticketing
            </p>
            <form className="sm:flex sm:gap-3 sm:items-center">
              <input
                type="text"
                placeholder="Please enter your e-mail address"
                className="border border-black bg-transparent py-2 px-4 rounded-full placeholder:text-white w-full sm:w-[70%] h-12"
              />
              <button
                type="submit"
                className="bg-white text-black rounded-full px-4 h-12 flex items-center mt-3 justify-center w-full md:mt-0 sm:w-[20%]"
              >
                Join waitlist
              </button>
        </form>


          </div>
          <div>
            <Image
              src={BusinessManLaunch}
              alt="business man"
              width={440}
              height={440}
              className="w-fit position: relative z-10"
            />
          </div>
        </div>
      </div>
      <Image src={ComingSoonTag} alt="coming soon" className="w-full position: absolute bottom-0 -z-1"/>
    </main>
  );
};

export default HeroPage;
