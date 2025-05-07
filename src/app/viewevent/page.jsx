'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/src/components/Footer';
import Navbar from '@/src/components/Navbar';
import { Transfer, Schedule, Location} from "../assets/index";
import Image from "next/image";

const page = () => {
    const [registered, setRegistered] = useState(true);
    const router = useRouter();

    return (
        <div className="min-h-screen">
            <div className="mx-auto p-4 bg-gray-500">
                <Navbar />

                <main className='bg-white justify-center items-center mx-auto p-10 w-[60%]'>

                    <div className='flex mx-auto'>
                        <div className='w-[50%]'>
                            <div className="  bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg h-48 w-[35%] flex text-white font-semibold">
                                Event Image
                            </div>

                            <div className="text-sm text-gray-700">
                                <p>Hosted by</p>
                                <p className="font-medium">Byro Africa</p>

                            </div>

                            <div className='flex'>
                                <span>
                                    <Image
                                        src={Transfer}
                                        alt="Transfer button"
                                        width={24}
                                        height={24}
                                        priority
                                    />
                                </span>
                                <p className="text-blue-500 text-lg">Transfer Ticket</p>
                            </div>

                        </div>

                        <div className='w-[50%] space-y-4'>
                            <div>
                                <h1 className='text-xl font-semibold text-[#2653EB]'>Event Name</h1>
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

                            <div className="bg-gray-50 border rounded-lg p-4">
                                    {registered ? (
                                        <div>
                                            <p className="text-green-600 font-medium">You've Registered</p>
                                            <p className="text-sm text-gray-500">
                                                No longer able to attend? <a href="#" className="text-blue-500 underline">Cancel registration</a>
                                            </p>
                                            <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer">View ticket</button>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-gray-700">Welcome! To join the event, please register below.</p>
                                            <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md">Register</button>
                                        </div>
                                    )}
                                </div>
                       
                        </div>
                    </div>
                    <section className="mt-8 bg-white p-6">
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