import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Footer = () => {
    return (
        <footer className='bg-gradient-to-r from-indigo-100 to-pink-100'>
            <div className='container mx-auto px-4 py-8'>
                {/* Main Content */}
                <div className='flex flex-col md:flex-row md:justify-between md:items-start space-y-8 md:space-y-0 md:space-x-8'>
                    {/* Logo and Description */}
                    <div className='space-y-4 max-w-md'>
                        <div className='logo'>
                            <Link href="/">
                                <Image 
                                    src="/assets/images/logo.svg" 
                                    alt="byro logo" 
                                    width={100} 
                                    height={40} 
                                />
                            </Link>
                        </div>
                        <p className='text-base text-[#5C6C7E] font-normal'>
                            Seamless, Secure, and Decentralized Event Ticketing
                        </p>
                    </div>

                    {/* Links Section */}
                    <div className='flex flex-col md:flex-row md:space-x-20 space-y-8 md:space-y-0'>
                        <div>
                            <h5 className='text-lg text-black font-bold mb-4'>About Us</h5>
                            <div className='space-y-2'>
                                <Link href="/">
                                    <p className='text-[#5C6C7E] text-sm hover:text-blue-600 transition-colors'>Terms of Use</p>
                                </Link>
                                <Link href="/">
                                    <p className='text-[#5C6C7E] text-sm hover:text-blue-600 transition-colors'>Service Policy</p>
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h5 className='text-lg text-black font-bold mb-4'>Services</h5>
                            <div className='space-y-2'>
                                <Link href="/">
                                    <p className='text-[#5C6C7E] text-sm hover:text-blue-600 transition-colors'>Event Ticketing</p>
                                </Link>
                                <Link href="/">
                                    <p className='text-[#5C6C7E] text-sm hover:text-blue-600 transition-colors'>Gaming</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media Icons */}
                <div className='flex justify-center space-x-6 py-8'>
                    <Link href="/" className='hover:opacity-80 transition-opacity'>
                        <Image 
                            src="/assets/images/telegram.png" 
                            alt="Telegram" 
                            width={30} 
                            height={30} 
                            className="w-8 h-8"
                        />
                    </Link>
                    <Link href="/" className='hover:opacity-80 transition-opacity'>
                        <Image 
                            src="/assets/images/facebook.png" 
                            alt="Facebook" 
                            width={30} 
                            height={30} 
                            className="w-8 h-8"
                        />
                    </Link>
                    <Link href="/" className='hover:opacity-80 transition-opacity'>
                        <Image 
                            src="/assets/images/youtube.png" 
                            alt="YouTube" 
                            width={30} 
                            height={30} 
                            className="w-8 h-8"
                        />
                    </Link>
                    <Link href="/" className='hover:opacity-80 transition-opacity'>
                        <Image 
                            src="/assets/images/x.png" 
                            alt="X (Twitter)" 
                            width={30} 
                            height={30} 
                            className="w-8 h-8"
                        />
                    </Link>
                </div>

                {/* Divider and Copyright */}
                <hr className='border-t border-[#5C6C7E] w-full max-w-4xl mx-auto opacity-30' />
                <p className='text-gray-400 text-xs text-center py-4'>
                    &#169; Byro Africa. All Rights Reserved.
                </p>
            </div>
        </footer>
    )
}

export default Footer