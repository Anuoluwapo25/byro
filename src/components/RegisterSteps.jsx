
import React from "react";
import {StepOneIcon, StepTwoIcon, StepThreeIcon, StepFourIcon, StepFiveIcon } from "../app/assets/index";
import Image from "next/image";


const steps = [
  {
    id: 1,
    icon: <Image src={StepOneIcon} alt="arrowIcon" />,
    title: "Step 1",
    description: "Click 'Register' and enter email and password",
  },
  {
    id: 2,
    icon: <Image src={StepTwoIcon} alt="emailIcon" />,
    title: "Step 2",
    description: "Enter the verification code sent to your email",
  },
  {
    id: 3,
    icon: <Image src={StepThreeIcon} alt="phoneIcon" />,
    title: "Step 3",
    description: "Verify your phone number.",
    addOns: "Enter the OTP code sent to the phone number you registered",
  },
  {
    id: 4,
    icon: <Image src={StepFourIcon} alt="organizeIcon" />,
    title: "Step 4",
    description: "Yay! You can now start organizing!",
  },
  {
    id: 5,
    icon: <Image src={StepFiveIcon} alt="profileIcon" />,
    title: "Step 5",
    description: "Please KYC to be able to organize more events",
  },
];

const RegisterSteps = () => {
 
  return (
    <div className=" bg-gradient-to-r from-indigo-100 to-pink-100">
      <div className="py-16 flex flex-col-reverse p-4 gap-4 md:flex-row justify-between items-center container mx-auto">
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center p-4 rounded-lg shadow-md bg-white w-fit`}
            >
              <span className="text-2xl mr-4">{step.icon}</span>
              <div>
                <h3 className="font-semibold text-black">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {step?.addOns && <p className="text-gray-600">{step.addOns}</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 pr-10 md:mt-0">
          <h2 className="text-sm text-black font-bold">ORGANIZE AN EVENT IN JUST</h2>
          <h1 className="text-5xl font-bold text-blue-600">5 Steps</h1>
          <button 
          
          className="mt-4 px-8 py-3 bg-green-500 text-white font-semibold rounded-full shadow-md hover:bg-green-600">
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterSteps;
