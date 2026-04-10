// components/EmptyState.jsx
import { emptyEventImg } from "../../app/assets/index";
import Image from "next/image";
import React from "react";

const EmptyState = ({ onCreateEvent }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div>
        <Image src={emptyEventImg} alt="empty sign" width={200} height={200} />
      </div>
      <h3 className="text-[32px] text-[#1E1E1E] font-semibold mt-6">
        No Upcoming Events
      </h3>
      <p className="text-[#707070] text-center text-[20px] mt-2">
        You have no upcoming events. Why not host one?
      </p>
      <button
        onClick={onCreateEvent}
        className="mt-6 bg-[#FAFAFA] border border-[#EAEAEA] hover:bg-[#fafafae2] text-[#1E1E1E] font-medium py-2 px-6 rounded-full transition-colors"
      >
        Create Event
      </button>
    </div>
  );
};

export default EmptyState;
