'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/src/components/Footer';
import Navbar from '@/src/components/Navbar';

const page = () => {
    const [registered, setRegistered] = useState(true);
    const router = useRouter();

    return (
        <div className="container mx-auto p-4">
            <Navbar />

            <div className='bg-white'>
          
            <div className="bg-white  rounded-xl p-6 flex flex-col md:flex-row gap-6">
               
                <div className="w-full md:w-1/4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg h-48 flex items-center justify-center text-white font-semibold">
                    Event Image
                </div>

              
                <div className="flex-1 space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Event Name</h2>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span>📅 Tuesday, 28th April 2025</span>
                            <span>🕒 2:00 PM to 4:00 PM</span>
                        </div>
                        <div className="text-sm text-gray-500">📍 Byro Headquarters, Lagos, Nigeria</div>
                    </div>

                    <div className="bg-gray-50 border rounded-lg p-4">
                        {registered ? (
                            <div>
                                <p className="text-green-600 font-medium">You've Registered</p>
                                <p className="text-sm text-gray-500">
                                    No longer able to attend? <a href="#" className="text-blue-500 underline">Cancel registration</a>
                                </p>
                                <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md">View ticket</button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-700">Welcome! To join the event, please register below.</p>
                                <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md">Register</button>
                            </div>
                        )}
                    </div>

                    {/* Host + Ticket Info */}
                    <div className="flex flex-wrap gap-4">
                        <div className="text-sm text-gray-700">
                            <p>Hosted by</p>
                            <p className="font-medium">Byro Africa</p>
                            <p className="text-blue-500 underline text-xs">Transfer Ticket</p>
                        </div>
                        <div className="text-sm text-gray-700">
                            <p>💲 $100</p>
                            <p className="text-xs text-gray-500">USDC ON BASE</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <section className="mt-8 bg-white p-6 rounded-xl shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">About Event</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
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

            <Footer />
            </div>
        </div>
    );
};

export default page;