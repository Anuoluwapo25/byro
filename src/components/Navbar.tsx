"use client";
import React, { useState, useRef, useEffect } from "react";
import { searchIcon, eventIcon } from "../app/assets/index";
// import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PrivyButton from "./auth/PrivyButton";
import { usePrivy } from "@privy-io/react-auth";
import { FaRegUserCircle } from "react-icons/fa";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { ready, authenticated } = usePrivy();
  const pathname = usePathname();
  // const router = useRouter();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  type UserDetails = {
    username?: string;
    email?: string;
    // add other fields if needed
  };

  const [user, setUser] = useState<UserDetails | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("userDetails");
      setUser(stored ? JSON.parse(stored) : null);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // useEffect(() => {
  //   if (ready && authenticated) {
  //     router.push("/events");
  //   }
  // }, [ready, authenticated, router]);

  const isActive = (href: string) => pathname === href;

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
    <nav className="bg-white shadow-md top-0 left-0 w-full z-50 border border-b">
      <div className="container mx-auto px-4">
        {!authenticated && (
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
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
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
        {authenticated && (
          <>
            {/* Desktop View */}
            <div className="hidden lg:flex items-center justify-between py-4 bg-[#FFFFFF]">
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
                      <Image
                        src={eventIcon}
                        alt="Event Icon"
                        width={20}
                        height={20}
                        color={`${isActive("/events") ? "blue" : "gray"}`}
                      />
                      <Link
                        href="/events"
                        className={`${isActive("/events")
                            ? "text-blue-600"
                            : "text-gray-400 hover:text-gray-600"
                          }`}
                      >
                        My Events
                      </Link>
                    </div>

                    <div className="flex items-center space-x-2 cursor-pointer rounded-full py-2 px-4 hover:text-gray-600 transition-colors">
                      <Link
                        href="/events/browse"
                        className={`${isActive("/events/browse")
                            ? "text-blue-600"
                            : "text-gray-400 hover:text-gray-600"
                          }`}
                      >
                        Explore
                      </Link>
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
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    aria-label="profile-menu"
                    className="flex items-center gap-3 py-3 px-4 rounded-lg focus:outline-none cursor-pointer"
                    onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  >
                    <FaRegUserCircle color="black" size={20} />

                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
                      <Link href={"/profile"}>
                        <div className="p-4 border-b">
                          <div className="font-bold text-lg text-[#1e1e1e]">
                            {user?.username || "No Name"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user?.email || "No Email"}
                          </div>
                        </div>
                      </Link>{" "}
                      <div className="p-4">
                        <PrivyButton />
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  href={"/events/create"}
                  className="bg-[#1F6BFF] text-white rounded-[20px] py-[12px] px-[16px]"
                >
                  Create Event
                </Link>
                {/* <PrivyButton /> */}
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
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
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
