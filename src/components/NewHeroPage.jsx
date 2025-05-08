"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { ManSeating } from "../app/assets/index";

const NewHeroPage = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Email submitted:', email);
    };

    return (
        <main className="bg-white px-4">
            {/* Shared container with max width */}
            <div className="max-w-6xl mx-auto">

                {/* Hero Section */}
                <section className="py-10 md:py-16 flex flex-col-reverse md:flex-row items-center mx-auto justify-between gap-8 md:gap-12">
                    
                    {/* Text Section */}
                    <div className="md:w-1/2 space-y-6">
                        <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[2.75rem] font-bold leading-tight">
                            <span className="bg-gradient-to-r from-[#0057FF] to-[#4F8BFF] text-transparent bg-clip-text block">
                                One Platform
                            </span>
                            <span className="text-[#0B243F] block">Endless Events</span>
                        </h1>

                        <p className="text-base sm:text-lg text-[#0B243F]">
                            Create your event page, invite friends, and start selling tickets. Host an unforgettable event today!
                        </p>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Email Address..."
                                className="flex-grow border border-[#B7E9D5] bg-[#E8F8F2] px-4 py-3 rounded-full placeholder:text-[#16B979]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                className="bg-[#16B979] text-white px-6 py-3 rounded-full w-full sm:w-auto"
                            >
                                Get Started
                            </button>
                        </form>
                    </div>

                    {/* Image Section */}
                    <div className="hidden md:flex md:w-1/2 justify-center">
                        <Image
                            src={ManSeating}
                            alt="Man Seating"
                            width={805}
                            height={705}
                            className="w-full h-auto max-w-md"
                            priority
                        />
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="pb-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {[
                            { value: "$110B+", label: "Payments" },
                            { value: "15M+", label: "Events" },
                            { value: "100%", label: "Secure" },
                            { value: "1 Min", label: "Registration Time" }
                        ].map((item, index) => (
                            <div key={index}>
                                <div className="text-blue-500 text-2xl font-bold">{item.value}</div>
                                <div className="text-gray-600 text-sm">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </main>
    );
};

export default NewHeroPage;
