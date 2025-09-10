"use client";
import React, { useState, useRef, useEffect } from "react";
import { searchIcon, eventIcon } from "../app/assets/index";
// import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PrivyButton from "./auth/PrivyButton";
import { usePrivy } from "@privy-io/react-auth";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { ready, authenticated } = usePrivy();
  // const router = useRouter();

  // useEffect(() => {
  //   if (ready && authenticated) {
  //     router.push("/events");
  //   }
  // }, [ready, authenticated, router]);

  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDesktopSearchOpen && desktopSearchInputRef.current) {
      desktopSearchInputRef.current.focus();
    }
  }, [isDesktopSearchOpen]);

  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Function to toggle the mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setIsMobileSearchOpen(false);
    }
  };

  // Function to handle desktop search click
  const handleDesktopSearchClick = () => {
    setIsDesktopSearchOpen(true);
  };

  // Function to handle mobile search click
  const handleMobileSearchClick = () => {
    setIsMobileSearchOpen(true);
  };

  const handleSearchBlur = (
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setTimeout(() => {
      setter(false);
    }, 100);
  };

  return (
    <nav className="bg-blue-50 shadow-md top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4">
        {ready && !authenticated && (
          <>
            {/* Desktop View */}
            <div className="hidden lg:flex items-center justify-between py-4">
              <div>
                <Link href="/">
                  <Image
                    src="/assets/images/logo.svg"
                    alt="byro logo"
                    width={100}
                    height={40}
                  />
                </Link>
              </div>

              <div className="flex items-center space-x-8 flex-grow justify-center">
                {!isDesktopSearchOpen ? (
                  <div
                    className="flex items-center space-x-2 cursor-pointer rounded-full py-2 px-4 hover:text-gray-600 transition-colors"
                    onClick={handleDesktopSearchClick}
                  >
                    <span className="text-gray-400">Explore Events</span>
                    <Image
                      src={searchIcon}
                      alt="Search Icon"
                      width={20}
                      height={20}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      ref={desktopSearchInputRef}
                      type="text"
                      placeholder="Explore Events"
                      className="bg-gray-50 text-black placeholder-gray-400 border border-gray-200 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                      onBlur={() => handleSearchBlur(setIsDesktopSearchOpen)}
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                )}
              </div>

              <PrivyButton />
            </div>

            {/* Mobile View */}
            <div className="lg:hidden">
              <div className="flex items-center justify-between py-4">
                <div>
                  <Link href="/">
                    <Image
                      src="/assets/images/logo.svg"
                      alt="byro logo"
                      width={80}
                      height={32}
                    />
                  </Link>
                </div>

                <div className="flex items-center space-x-3">
                  <PrivyButton />

                  <button
                    aria-label="hamburger-menu"
                    onClick={toggleMenu}
                    className="text-gray-600 focus:outline-none"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {isMenuOpen ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6h16M4 12h16m-7 6h7"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile Menu */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col space-y-4 px-4">
                  {!isMobileSearchOpen ? (
                    <div
                      className="flex items-center space-x-2 cursor-pointer rounded-full py-2 px-4 hover:text-gray-600 transition-colors justify-center"
                      onClick={handleMobileSearchClick}
                    >
                      <span className="text-gray-400">Explore Events</span>
                      <Image
                        src={searchIcon}
                        alt="Search Icon"
                        width={20}
                        height={20}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        ref={mobileSearchInputRef}
                        type="text"
                        placeholder="Explore Events"
                        className="bg-gray-50 text-black placeholder-gray-400 border border-gray-200 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        onBlur={() => handleSearchBlur(setIsMobileSearchOpen)}
                      />
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* AUTHENTICATED STATE */}
        {ready && authenticated && (
          <>
            {/* Desktop View */}
            <div className="hidden lg:flex items-center justify-between py-4">
              <div>
                <Link href="/">
                  <Image
                    src="/assets/images/logo.svg"
                    alt="byro logo"
                    width={100}
                    height={40}
                  />
                </Link>
              </div>

              <div className="flex items-center space-x-8 flex-grow justify-center">
                {!isDesktopSearchOpen ? (
                  <>
                    <div className="flex items-center space-x-2 cursor-pointer py-2 px-4 transition-colors">
                      <Link
                        href="/events"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        Events
                      </Link>
                      <Image
                        src={eventIcon}
                        alt="Event Icon"
                        width={20}
                        height={20}
                      />
                    </div>

                    <div
                      className="flex items-center space-x-2 cursor-pointer rounded-full py-2 px-4 hover:text-gray-600 transition-colors"
                      onClick={handleDesktopSearchClick}
                    >
                      <span className="text-gray-400">Explore Events</span>
                      <Image
                        src={searchIcon}
                        alt="Search Icon"
                        width={20}
                        height={20}
                      />
                    </div>
                  </>
                ) : (
                  <div className="relative">
                    <input
                      ref={desktopSearchInputRef}
                      type="text"
                      placeholder="Explore Events"
                      className="bg-gray-50 text-black placeholder-gray-400 border border-gray-200 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                      onBlur={() => handleSearchBlur(setIsDesktopSearchOpen)}
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  href="/events/create"
                  className="text-[#09D059] font-black cursor-pointer text-[16px] hover:text-green-600 transition-colors"
                >
                  Create Event
                </Link>
                <PrivyButton />
              </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden">
              <div className="flex items-center justify-between py-4">
                <div>
                  <Link href="/">
                    <Image
                      src="/assets/images/logo.svg"
                      alt="byro logo"
                      width={80}
                      height={32}
                    />
                  </Link>
                </div>

                <div className="flex items-center space-x-3">
                  <PrivyButton />

                  <button
                    aria-label="hamburger-menu"
                    onClick={toggleMenu}
                    className="text-gray-600 focus:outline-none"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {isMenuOpen ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6h16M4 12h16m-7 6h7"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile Menu */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col space-y-4 px-4">
                  {/* Events Link */}
                  <Link
                    href="/events"
                    className="flex items-center justify-center space-x-2 py-2 px-4 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-gray-400 hover:text-gray-600">
                      Events
                    </span>
                    <Image
                      src={eventIcon}
                      alt="Event Icon"
                      width={20}
                      height={20}
                    />
                  </Link>

                  {/* Search */}
                  {!isMobileSearchOpen ? (
                    <div
                      className="flex items-center space-x-2 cursor-pointer rounded-full py-2 px-4 hover:text-gray-600 transition-colors justify-center"
                      onClick={handleMobileSearchClick}
                    >
                      <span className="text-gray-400">Explore Events</span>
                      <Image
                        src={searchIcon}
                        alt="Search Icon"
                        width={20}
                        height={20}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        ref={mobileSearchInputRef}
                        type="text"
                        placeholder="Explore Events"
                        className="bg-gray-50 text-black placeholder-gray-400 border border-gray-200 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        onBlur={() => handleSearchBlur(setIsMobileSearchOpen)}
                      />
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                  )}

                  {/* Create Event */}
                  <Link
                    href="/events/create"
                    className="flex items-center justify-center py-2 px-4 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-[#09D059] font-black text-[16px] hover:text-green-600">
                      Create Event
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
