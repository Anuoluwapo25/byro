"use client";
import React from "react";
import Image from "next/image";

export const ImageCollage = () => {
  const images = [
    {
      src: "/images/collage/wine-glass.png",
      alt: "Wine toast celebration",
      className: "col-span-1 row-span-2",
      height: "h-80",
    },
    {
      src: "/images/collage/group-toast.png",
      alt: "Group toast celebration",
      className: "col-span-1 row-span-2",
      height: "h-80",
    },
    {
      src: "/images/collage/confetti.png",
      alt: "Wine toast celebration",
      className: "col-span-1 row-span-2",
      height: "h-80",
    },
    {
      src: "/images/collage/celebration.png",
      alt: "Wine toast celebration",
      className: "col-span-1 row-span-2",
      height: "h-80",
    },
    {
      src: "/images/collage/heart-background.png",
      alt: "Wine toast celebration",
      className: "col-span-1 row-span-2",
      height: "h-80",
    },
    {
      src: "/images/collage/dinning.png",
      alt: "People dinning together",
      className: "col-span-1 row-span-2",
      height: "h-80",
    },
    {
      src: "/images/collage/talking.png",
      alt: "Wine toast celebration",
      className: "col-span-1 row-span-2",
      height: "h-80",
    },
    {
      src: "/images/collage/black-white-toast.png",
      alt: "Wine toast celebration",
      className: "col-span-1 row-span-2",
      height: "h-80",
    },
  ];

  return (

        <div className='bg-white'>
            <div className='container mx-auto px-4'>
                <div className='flex space-x-5 items-center justify-start py-10 md:justify-center flex-nowrap'>
                    <div className='flex-shrink-0 bg-blue-500 w-[272px] h-[325px]'>
                    </div>

                    <div className='flex-shrink-0 flex flex-col'>
                        <div className='bg-red-500 w-[272px] h-[172px]'>
                        </div>
                        <div className='bg-green-700 w-[272px] h-[172px] mt-4'>
                        </div>
                    </div>

                    <div className='flex-shrink-0 flex flex-col'>
                        <div className='bg-red-200 w-[272px] h-[280px]'>
                        </div>
                        <div className='bg-green-300 w-[272px] h-[80px] mt-4'>
                        </div>
                    </div>

                    <div className='flex-shrink-0 bg-blue-300 w-[272px] h-[286px]'>
                    </div>

                    <div className='flex-shrink-0 flex flex-col'>
                        <div className='bg-red-300 w-[272px] h-[183px]'>
                        </div>
                        <div className='bg-green-500 w-[272px] h-[183px] mt-4'>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  );
};
