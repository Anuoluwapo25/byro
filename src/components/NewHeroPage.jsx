import React from 'react'
import Image from 'next/image';
import { ManSeating } from "../app/assets/index";

const NewHeroPage = () => {
    return (
        <main className="bg-white pt-12 position: relative">
            <div className="container mx-auto p-4 space-y-24">
                <div className='flex'>
                    <div>
                        <h4 className='text-[3.5rem] font-bold bg-gradient-to-r from-[#0057FF] to-[#4F8BFF] text-transparent bg-clip-text'>One Platform</h4>
                        <h4 className="text-[3.5rem] font-bold text-[#0B243F]">Endless Events</h4>

                        <p className='text-[1.25rem] text-[#0B243F]'>
                            Create your event page, invite friends, and start
                            selling tickets. Host an unforgettable event today!
                        </p>

                        <form className="sm:flex sm:gap-3 sm:items-center">
                            <input
                                type="text"
                                placeholder="Email Address..."
                                className="border border-[#B7E9D5] bg-[#E8F8F2] bg-transparent py-2 px-4 rounded-full placeholder:text-[#16B979] w-full sm:w-[70%] h-12"
                            />
                            <button
                                type="submit"
                                className="bg-[#16B979] text-lg text-white rounded-full px-4 h-12 flex items-center mt-3 justify-center w-full md:mt-0 sm:w-[20%]"
                            >
                                Get Started
                            </button>
                        </form>
                    </div>

                    <div>
                        <Image
                            src={ManSeating}
                            alt="Man Seating"
                            width={600}
                            height={525}
                            className="w-fit"
                            priority
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}

export default NewHeroPage