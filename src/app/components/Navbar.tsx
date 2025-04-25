import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
// import ConnectWallet from './ConnectWallet'


const Navbar = () => {
    return (
        <header className='flex justify-around bg-gradient-to-r from-indigo-100 to-pink-100 inherit items-center p-4 shadow-md'>
            <div>
                <Link href="/">
                    <Image src="/assets/images/logo.svg" 
                    alt="byro logo" 
                    width={100} 
                    height={40} />
                </Link>
            </div>
            <nav className='flex space-x-10'>
                <Link href="/" className='text-[#5C6C7E] text-base'>Home</Link>
                <Link href="/about" className='text-[#5C6C7E] text-base'>Events</Link>
                <Link href="/services" className='text-[#5C6C7E] text-base'>FAQs</Link>
                <Link href="/services" className='text-[#5C6C7E] text-base'>Commnunity</Link>
            </nav>

            {/* <div>
                <ConnectWallet />
            </div> */}
        </header>
    )
}

export default Navbar