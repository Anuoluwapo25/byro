import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Footer = () => {
    return (
        <footer className='bg-gradient-to-r from-indigo-100 to-pink-100'>

            <div className='justify-center items-center md:p-5'>
            <div className='flex flex-row p-8 space-x-32 justify-center items-center md:mx-auto'>

            <div className='space-y-4'>
                <div className='logo'>
                    <Link href="/">
                    <Image src="/assets/images/logo.svg" alt="byro logo" width={100} height={40} />
                    </Link>
                </div>
                
                <div>
                    <p className='text-base text-[#5C6C7E] font-normal'>
                        Seamless, Secure, and Decentralized Event Ticketing
                    </p>
                </div>

                {/* here */}
                </div>

                <div className=' flex space-x-20 '>
                    <div>
                        <h5 className='text-lg text-black font-bold mb-5'>About Us</h5>
                        <Link href="/">
                        <p className='text-[#5C6C7E] text-sm mb-2'>Terms of Use</p>
                        </Link>

                        <Link href="/">
                        <p className='text-[#5C6C7E] text-sm'>Service Policy</p>
                        </Link>
                    </div>

                    <div>
                        <h5 className='text-lg text-black font-bold mb-5'>Services</h5>
                        <Link href="/">
                        <p className='text-[#5C6C7E] text-sm mb-2'>Event Ticketing</p>
                        </Link>

                        <Link href="/">
                        <p className='text-[#5C6C7E] text-sm'>Gaming</p>
                        </Link>
                    </div>
            </div>
            </div>

            <div className='flex space-x-1 justify-center items-center p-5'>
                    <Link href="/">
                        <Image src="/assets/images/telegram.png" alt="" width={30} height={50} />
                    </Link>
                    
                    <Link href="/">
                        <Image src="/assets/images/facebook.png" alt="" width={30} height={100} />
                    </Link>
                    
                    <Link href="/">
                        <Image src="/assets/images/youtube.png" alt="" width={30} height={100} />
                    </Link>
                    
                    <Link href="/">
                        <Image src="/assets/images/x.png" alt="" width={30} height={100} />
                    </Link>
                </div>

            <hr className='border-t-2 border-[#5C6C7E] w-[80%] mx-auto' />
            <p className='text-gray-400 text-xs text-center p-5'>&#169; Byro Africa. All Rights Reserved.</p>
            </div>
        </footer>
    )
}

export default Footer