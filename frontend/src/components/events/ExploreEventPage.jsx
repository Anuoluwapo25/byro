"use client";
import React, { useState } from "react";

import { Box, Users, Palette, Dumbbell, Monitor, Settings } from "lucide-react";
import EventsContainer from "./EventsContainer";

const CategoryCard = ({
  title,
  eventCount,
  icon: Icon,
  bgColor = "bg-blue-100",
  isSelected,
  onClick,
}) => {
  return (
    <div
      className={`${bgColor} rounded-2xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer`}
      onClick={onClick}
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-blue-600 font-medium text-sm">{eventCount} Events</p>
      </div>
      <div className="text-4xl">
        <Icon className="w-8 h-8 text-blue-600" />
      </div>
    </div>
  );
};

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    // Here you would typically trigger your filtering logic
    console.log("Filtering events by category:", category);
  };

  const categories = [
    {
      id: 1,
      title: "Web3 & Crypto",
      eventCount: "1k",
      icon: Box,
    },
    {
      id: 2,
      title: "Entertainment",
      eventCount: "1k",
      icon: Users,
    },
    {
      id: 3,
      title: "Art & Culure",
      eventCount: "1k",
      icon: Palette,
    },
    {
      id: 4,
      title: "Fitness",
      eventCount: "1k",
      icon: Dumbbell,
    },
    {
      id: 5,
      title: "Conference",
      eventCount: "1k",
      icon: Monitor,
    },
    {
      id: 6,
      title: "Technology",
      eventCount: "1k",
      icon: Settings,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-10">
        <h1 className="font-bold text-xl sm:text-2xl lg:text-[28px] text-[#1E1E1E] mb-2 sm:mb-3">
          Browse Events
        </h1>
        <p className="font-medium text-[#707070] text-sm sm:text-base lg:text-[20px] leading-relaxed">
          Discover popular events near you, browse by category and explore for
          more options
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            title={category.title}
            eventCount={category.eventCount}
            icon={category.icon}
            bgColor={category.bgColor}
            isSelected={selectedCategory === category.id}
            onClick={() => handleCategoryClick(category.id)}
          />
        ))}
      </div>

      {selectedCategory && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700">
            Filtering events by:{" "}
            <span className="font-semibold text-blue-600">
              {categories.find((cat) => cat.id === selectedCategory)?.title}
            </span>
          </p>
          <button
            onClick={() => setSelectedCategory(null)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear filter
          </button>
        </div>
      )}
      <div className="flex flex-col py-4 sm:py-6 gap-y-2 sm:gap-y-1">
        <p className="text-black font-extrabold text-2xl sm:text-3xl lg:text-[36px]">Feature Events</p>
        <div>
          <EventsContainer />
        </div>
      </div>
    </div>
  );
}
