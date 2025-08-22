import React, { useState } from "react";
import { Trash2, Edit3 } from "lucide-react";
import { going, notGoing, waitlist } from "../../assets/index";
import Image from "next/image";

const Attendees = () => {
  const [attendeesData, setAttendeesData] = useState([
    {
      id: 1,
      name: "Francis David",
      email: "disual@byro.africa",
      isGoing: true,
    },
    {
      id: 2,
      name: "Samuel Ajayi",
      email: "sam@byro.africa",
      isGoing: false,
    },
    {
      id: 3,
      name: "Robert Aruleba",
      email: "Robert@byro.africa",
      isGoing: false,
    },
    {
      id: 4,
      name: "Temitope",
      email: "Temi@byro.africa",
      isGoing: true,
    },
  ]);

  return (
    <div>
      <div className="flex space-x-10 justify-center">
        {/* main */}
        <div className="border-2 border-solid rounded-lg bg-gray-100">
          <div className="flex justify-evenly space-x-10 p-6">
            <div className="flex flex-col space-y-2 text-center">
              <span className="flex space-x-1">
                <Image src={waitlist} className="h-[24px] w-[24px]" />
                <p className="text-gray-600 text-sm">Waitlist</p>
              </span>
              <p className="text-black font-extrabold text-2xl">35</p>
            </div>

            <div className="flex flex-col space-y-2 text-center">
              <span className="flex space-x-1">
                <Image src={going} className="h-[24px] w-[24px]" />
                <p className="text-gray-600 text-sm">Going</p>
              </span>
              <p className="text-black font-extrabold text-2xl">10</p>
            </div>

            <div className="flex flex-col space-y-2 text-center">
              <span className="flex space-x-1">
                <Image src={notGoing} className="h-[24px] w-[24px]" />
                <p className="text-gray-600 text-sm">Not Going</p>
              </span>
              <p className="text-black font-extrabold text-2xl">5</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            text="Invite"
            className="bg-[#007AFF] rounded-lg p-2 text-base hover:bg-[#007AEF]"
          >
            Invite
          </button>

          <button
            type="submit"
            text="Invite"
            className="flex space-x-2 bg-[#007AFF] hover:bg-[#007AEF] rounded-lg p-2 text-base"
          >
            <Edit3 className="w-5 h-5" />
            <span className="font-medium">Edit Event</span>
          </button>
        </div>
      </div>

      <div className="flex justify-between my-8">
        <div>
          <h1 className="text-black font-bold">Attendees</h1>
        </div>

        <div>
          <input
            type="search"
            className="bg-gray-100 p-2 rounded-lg text-black outline-none"
            placeholder="Search for attendee..."
          />
        </div>
      </div>

      <div className="flex flex-col mt-5dn">
        {attendeesData.map((attendee) => (
          <div key={attendee.id} className="">
            <div className="flex justify-between flex-row border-b bg-gray-50 p-5">
              <h3 className="text-black font-medium">{attendee.name}</h3>

              <p className="text-base text-gray-300 text-left">
                {attendee.email}
              </p>

              <p className="text-blue-300 text-base">
                {attendee.isGoing ? "Going " : "Not Going"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Attendees;
