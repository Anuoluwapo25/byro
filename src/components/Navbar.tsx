"use client";
import React, { useState, useRef, useEffect } from "react";
import { searchIcon, eventIcon } from "../app/assets/index";
// import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PrivyButton from "./auth/PrivyButton";


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    <nav
      className="bg-white text-white py-4 shadow-md
                    fixed top-0 left-0 w-full z-50
                    lg:static lg:shadow-none"
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8 flex-grow justify-center">
          {/* Conditional rendering for desktop search */}
          {!isDesktopSearchOpen ? (
            <>
            {/* {isAuthenticated && ( */}
            <>
            <div className="flex items-center space-x-2 cursor-pointer py-2 px-4 transition-colors">
            <Link href="/events"
              className="text-gray-400"
              >
                Events
              </Link>
              
              <Image src={eventIcon} alt="Event Icon" width={20} height={20} />
            </div>
            </>
            
            {/* )} */}

              <div
                className="flex items-center space-x-2 cursor-pointer rounded-full py-2 px-4 hover:text-white transition-colors"
                onClick={handleDesktopSearchClick}
              >
                <span className="text-gray-400">Explore Events</span>
                {/* Search Icon */}
                <Image src={searchIcon} alt="Search Icon" width={20} height={20} />
              </div>
            </>
          ) : (
            <div className="relative">
              <input
                ref={desktopSearchInputRef}
                type="text"
                placeholder="Explore Events"
                className="bg-transparent text-black placeholder-gray-400
                           rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500
                           w-64"
                onBlur={() => handleSearchBlur(setIsDesktopSearchOpen)}
              />
              {/* Search Icon */}
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

        
        
        
        


        <div className="hidden lg:flex">

        {/* {isAuthenticated && ( */}
          
          <div className="flex items-center space-x-2 cursor-pointer py-2 px-4 ">
            <Link href="/events/create"
              className="text-[#09D059] font-black text cursor-pointer text-[16px] "
              >
                Create Event
              </Link>
              </div>
              
        {/* // )}; */}
        
          <PrivyButton 
          //  onLogin={() => setIsAuthenticated(true)}
          //  onLogout={() => setIsAuthenticated(false)}
          />
        </div>

        {/* Mobile Navigation (flex items for mobile) */}
        <div className="flex items-center space-x-4 justify-between lg:hidden">

          <div className="block">
            <PrivyButton 
            //  onLogin={() => setIsAuthenticated(true)}
            //  onLogout={() => setIsAuthenticated(false)}
            />
          </div>


          {/* Mobile Menu Button*/}
          <button aria-label="hamburger-menu" onClick={toggleMenu} className="text-black focus:outline-none">
            <svg
              className="w-8 h-8"
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
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MObile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-screen opacity-100 py-4" : "max-h-0 opacity-0"
          }`}
      >
        <div className="flex flex-col items-center space-y-4 px-4">
          {/* Conditional rendering for mobile search */}
          {!isMobileSearchOpen ? (
            <div
              className="flex items-center space-x-2 cursor-pointer bg-gray-800 rounded-full py-2 px-4 w-full max-w-xs hover:bg-gray-700 transition-colors text-white" /* Added text-white */
              onClick={handleMobileSearchClick}
            >
              <span className="text-gray-400">Explore Events</span>
              {/* Search Icon */}
              <svg
                className="text-gray-400"
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
          ) : (
            <div className="relative w-full max-w-xs">
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder="Explore Events"
                className="bg-transparent text-black placeholder-gray-400
                           rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500
                           w-full"
                onBlur={() => handleSearchBlur(setIsMobileSearchOpen)}
              />
              {/* Search Icon */}
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
    </nav>
  );
};

export default Navbar;