'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/src/components/Footer';
import Navbar from '@/src/components/Navbar';
import { Transfer, Schedule, Location, nft } from "../assets/index";
import Image from "next/image";
import { Ticket } from 'lucide-react';

const page = () => {
    const [registered, setRegistered] = useState(true);
    const [showTransferInput, setShowTransferInput] = useState(false);
    const [transferEmail, setTransferEmail] = useState('');
    const router = useRouter();

    const handleTransferClick = () => {
        setShowTransferInput(!showTransferInput);
    };

    const handleTransferSubmit = (e) => {
        e.preventDefault();
        // Handle the transfer logic here
        alert(`Ticket transfer request sent to ${transferEmail}`);
        setShowTransferInput(false);
        setTransferEmail('');
    };

    const handleRegister = () => {
        setRegistered(true);
    };

    const handleCancelRegistration = () => {
        setRegistered(false);
    };


    return (
        <div className="bg-gradient-to-r from-indigo-100 to-pink-100">
            <Navbar />
            <div className=" ">

                <main className='justify-center items-center mx-auto p-10 w-[60%]'>

                    <div className='flex gap-14 justify-center items-center'>
                        <div className=''>
                            {/* <div className="  bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg h-48 w-[35%] text-white font-semibold">
                                Event Image
                            </div> */}

                            <div className="w-52 h-52 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div className="text-white text-xs text-center mt-1">
                                    <div>Event</div>
                                    <div>Image</div>
                                </div>
                            </div>

                            {/* ticket transfer functionality */}

                            <div className="mt-6 mb-6">
                                <div className="font-bold text-black text-xl mb-1">Hosted by</div>
                                <div className="font-medium text-black text-sm mb-1">Byro office</div>
                                {!registered && (
                                    <div className="text-sm text-gray-600 mb-2">Is ticket transferable?</div>
                                )}
                                {registered && (
                                    <div>
                                        <button
                                            onClick={handleTransferClick}
                                            className="flex items-center text-blue-500 text-sm"
                                        >
                                            <Image
                                                src={Transfer}
                                                alt="Transfer Icon"
                                                width={24}
                                                height={24}
                                                className="mr-1"
                                            />
                                            Transfer Ticket
                                        </button>

                                        {/* Email Input for Ticket Transfer */}
                                        {showTransferInput && (
                                            <form onSubmit={handleTransferSubmit} className="mt-2">
                                                <div className="flex flex-col space-y-2">
                                                    <label htmlFor="email" className="text-sm text-gray-600">
                                                        Enter recipient's email:
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        value={transferEmail}
                                                        onChange={(e) => setTransferEmail(e.target.value)}
                                                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                                                        placeholder="example@email.com"
                                                        required
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            type="submit"
                                                            className="bg-blue-500 text-white px-4 py-1 rounded text-sm"
                                                        >
                                                            Send
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowTransferInput(false)}
                                                            className="bg-gray-300 text-gray-700 px-4 py-1 rounded text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center mb-6 bg-gray-50 border-2 rounded-lg w-full">
                                {/* <div className="bg-blue-100 rounded p-2 mr-3 transform -rotate-12">
                                    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                    </svg>
                                </div> */}

                                <Ticket className='bg-blue-500 mr-3 transform -rotate-12'/>
                                <div>

                                    <div className="font-bold text-black text-xl">$100</div>
                                    <div className="text-xs text-black">USDC ON BASE</div>
                                </div>
                            </div>

                        </div>

                        <div className='w-[50%] space-y-4'>

                            {/* Event name, date, time, venue, price need to change dynamically */}
                            <div className='bg-gray-50 border-2 rounded-lg w-full '>
                                <h1 className='text-xl font-semibold text-[#2653EB] mx-auto  p-5'>Event Name</h1>
                            </div>

                            <div className='flex'>
                                <span>
                                    <Image
                                        src={Schedule}
                                        alt="Schedule Icon"
                                        width={24}
                                        height={24}
                                    />
                                </span>
                                <div>
                                    <p className='text-lg font-semibold text-black'>Tuesday, 28th April 2025</p>
                                    <p className='text-black'>2:00 PM to 4:00 PM</p>
                                </div>
                            </div>

                            <div className='flex'>
                                <span>
                                    <Image
                                        src={Location}
                                        alt="Location Icon"
                                        width={24}
                                        height={24}
                                    />
                                </span>
                                <div>
                                    <p className='text-lg font-semibold text-black'>Byro Headquarters</p>
                                    <p className='text-black'>Lagos, Nigeria</p>
                                </div>
                            </div>


                            <div className="">
                                <div className="flex ">
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        {registered ? (
                                            <div className="text-justify">
                                                <h3 className="text-lg font-bold mb-1 text-black">You've Registered</h3>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    No longer able to attend? <br />
                                                    Notify the host by <button
                                                        onClick={handleCancelRegistration}
                                                        className="text-blue-500 underline"
                                                    >
                                                        canceling your registration
                                                    </button>.
                                                </p>
                                                <div className='flex text-center mx-auto gap-4'>
                                                    <button className="bg-green-500 text-sm text-white py-2 px-6 rounded-full">
                                                        View ticket
                                                    </button>
                                                    <button className="bg-blue-500 text-sm text-white py-2 px-6 rounded-full flex">
                                                        <Image
                                                            src={nft}
                                                            alt="NFT icon"
                                                            width={20}
                                                            height={20}
                                                            className="mr-2"
                                                        />
                                                        Mint Byro NFT
                                                    </button>
                                                </div>

                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <h3 className="text-lg font-bold text-black mb-2">Registration</h3>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Welcome! To join the event, please register below.
                                                </p>
                                                <button
                                                    onClick={handleRegister}
                                                    className="bg-green-500 text-white py-2 px-6 rounded-lg w-[80%]"
                                                >
                                                    Register
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <section className="mt-8 p-6">
                        <h3 className="text-3xl font-semibold text-gray-800 mb-2">About Event</h3>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Lorem ipsum dolor sit amet consectetur. Sit elementum
                            enim fermentum at tristique luctus vulputate tellus felis.
                            Rhoncus amet commodo sit aliquam pretium. Sed lacus sed
                            adipiscing sit magna mus eros sit. Lacus molestie in vivamus
                            metus tincidunt. Sem diam neque amet gravida quis. At gravida
                            diam sit lobortis purus sit nullam venenatis. Urna parturient
                            quam integer consectetur in lacus nec. Purus vitae in tellus
                            sit nulla nibh magna. Lacinia semper urna mi cursus libero
                            malesuada eu sit.
                        </p>
                    </section>

                </main>
            </div>
            <Footer />
        </div>
    );
};

export default page;