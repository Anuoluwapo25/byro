"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
// import { Wallet } from '@coinbase/onchainkit/wallet';
import LoginButton from "./LoginButton";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="flex justify-between items-center bg-gradient-to-r from-indigo-100 to-pink-100 p-4 shadow-md">
      <div className="flex items-center space-x-20">
        <Link href="/">
          <Image
            src="/assets/images/logo.svg"
            alt="byro logo"
            width={100}
            height={40}
          />
        </Link>
        <div className="md:hidden">
          <LoginButton />
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden text-[#5C6C7E]"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-10">
        <Link
          href="/"
          className="text-[#5C6C7E] text-base hover:text-blue-600 transition-colors"
        >
          Home
        </Link>
        <Link
          href="/events"
          className="text-[#5C6C7E] text-base hover:text-blue-600 transition-colors"
        >
          Events
        </Link>
        <Link
          href="/services"
          className="text-[#5C6C7E] text-base hover:text-blue-600 transition-colors"
        >
          FAQs
        </Link>
        <Link
          href="/services"
          className="text-[#5C6C7E] text-base hover:text-blue-600 transition-colors"
        >
          Community
        </Link>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden fixed inset-0 bg-white transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          <button
            className="absolute top-4 right-4 text-[#5C6C7E]"
            onClick={toggleMenu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <Link
            href="/"
            className="text-[#5C6C7E] text-xl hover:text-blue-600 transition-colors"
            onClick={toggleMenu}
          >
            Home
          </Link>
          <Link
            href="/events"
            className="text-[#5C6C7E] text-xl hover:text-blue-600 transition-colors"
            onClick={toggleMenu}
          >
            Events
          </Link>
          <Link
            href="/services"
            className="text-[#5C6C7E] text-xl hover:text-blue-600 transition-colors"
            onClick={toggleMenu}
          >
            FAQs
          </Link>
          <Link
            href="/services"
            className="text-[#5C6C7E] text-xl hover:text-blue-600 transition-colors"
            onClick={toggleMenu}
          >
            Community
          </Link>
        </div>
      </div>

      {/* Desktop Wallet and Login */}
      <div className="hidden md:flex items-center space-x-4">
        {/* <Wallet /> */}
        <LoginButton />
      </div>
    </header>
  );
};

export default Navbar;
