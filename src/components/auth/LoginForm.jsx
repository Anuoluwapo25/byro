"use client";

import React, { useEffect, useRef } from "react";
import Navbar from "../Navbar";
import { FaGoogle } from "react-icons/fa";
import { SignIcon } from "../../app/assets/index";
import Image from "next/image";

export default function LoginForm() {
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  return (
    <div className="bg-white">
      <Navbar />
      <div
        className="  flex items-center justify-center bg-white min-h-screen"
        aria-modal="true"
        // role="dialog"
      >
        <div className=" w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <Image
              src={SignIcon}
              alt="Signin Icon"
              className="w-[40px] h-[40px]"
              priority
            />
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              Welcome
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Please note the name here will be used as “Host name” when you
              create an event.
            </p>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-blue-600 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  ref={nameRef}
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-blue-600 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                  required
                />
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#007AFF] text-white rounded-full font-semibold hover:bg-blue-700 transition"
                >
                  Continue with Email
                </button>

                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition text-gray-700"
                  onClick={() => {
                    /* implement google sign-in handler here */
                  }}
                >
                  <FaGoogle className="w-4 h-4" />
                  <span className="font-medium">Sign in with Google</span>
                </button>
              </div>
            </form>

            {/* <div className="mt-4 text-center text-xs text-gray-400">
              By continuing you agree to our{" "}
              <a href="https://byro.africa/">
                <span className="text-blue-600">Terms</span>
              </a>{" "}
              and{" "}
              <a href="https://byro.africa/" className="hover:text-blue-50">
                <span className="text-blue-600"> Privacy Policy</span>
              </a>
              .
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
