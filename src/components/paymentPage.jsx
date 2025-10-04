"use client";
import React from "react";

export default function checkout() {
  return (
    <div className="bg-white ">
      <div className="flex">

        <div>
          <h1 className=" font-bold text-2xl text-[#1E1E1E]">Event Registration</h1>
          <p className="font-medium text-[#707070]">Compelete your registration for Byro Event 2024</p>
        </div>

        <div className="flex">
            <div>
                <input type="checkbox" name="1" id="" /> <p className="text-[#1A1A1A]">Basic Information</p>
            </div>

            <div>
                <input type="checkbox" name="1" id="" /> <p className="text-[#1A1A1A]">Review Details</p>
            </div>

            <div>
                <input type="checkbox" name="1" id="" /> <p className="text-[#1A1A1A]">Make Payment</p>
            </div>

        </div>


      </div>
    </div>
  );
}
