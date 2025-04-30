import React from "react";
import {purpleArrow, yellowArrow} from "../app/assets/index"
import Image from "next/image";

const steps = [
  {
    id: 1,
    title: "Select Your Event",
    description:
      "Browse upcoming events and choose the one you want to attend. View event details, ticket types, and pricing options.",
    arrow: <Image src={purpleArrow} alt="purpleArrow" />
  },
  {
    id: 2,
    title: "Pay Securely with Crypto",
    description:
      "Complete your purchase using Stablecoins or your local currency. Your transaction is secured with blockchain technology.",
    arrow: <Image src={yellowArrow} alt="yellowArrow" />
  },
  {
    id: 3,
    title: "Get Your NFT Ticket",
    description:
      "Receive your digital NFT ticket instantly. Simply scan the QR code at the venue for seamless entry—no paper tickets needed!",
  },
];

const EventSteps = () => {
  return ( 
    <div className="p-8 bg-blue-600">
        <div className="container mx-auto md:p-8">
        <h2 className="text-2xl font-semibold text-center text-white py-5">Book an Event in Just 3 Steps</h2>
        <div className="flex flex-col gap-3 justify-between items-center md:flex-row py-4">
            {steps.map((step, index) => (
                <div key={index} className="relative flex flex-col bg-white rounded-lg shadow-lg w-full md:h-fit  md:w-64 p-3">
                    <div className=" flex justify-center items-center text-xl text-blue-700 border-gray-400 font-bold p-5 border-4 rounded-full w-10 h-10">{step.id}</div>
                    <h3 className="font-bold text-black text-xl">{step.title}</h3>
                    <p className="text-sm text-[#5C6C7E]">{step.description}</p>
                    {step?.arrow && <span className="hidden md:block  absolute -right-64 w-full">{step.arrow}</span>}
                    
                </div>

            ))}

        </div>
      
        <div className="flex justify-end mt-8">
        <button className="mt-8 px-6 py-2 bg-green-500 text-white font-semibold rounded-full shadow-md hover:bg-green-600">
            Coming Soon
        </button>
        </div>
        </div>
      
    </div>
  );
};

export default EventSteps;
