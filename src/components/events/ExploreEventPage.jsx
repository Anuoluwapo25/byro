"use client"
import React, { useState } from "react";

import { Box, Users, Palette, Dumbbell, Monitor, Settings } from "lucide-react";

const CategoryCard = ({
  title,
  eventCount,
  icon: Icon,
  bgColor = "bg-blue-100",
  isSelected, 
  onClick
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
      console.log('Filtering events by category:', category);
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
    <div className="max-w-6xl mx-auto p-6">
      <div className=" mb-10">
        <h1 className="font-black text-4xl text-black mb-3">Browse Events</h1>
        <p className="font-medium text-black">
          Discover popular events near you, browse by category and explore for
          more options
        </p>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Categories</h1>

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
            Filtering events by: <span className="font-semibold text-blue-600">{categories.find(cat => cat.id === selectedCategory)?.title}</span>
          </p>
          <button 
            onClick={() => setSelectedCategory(null)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear filter
          </button>
        </div>
      )}

    </div>
  );
}
