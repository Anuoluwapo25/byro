import React from 'react'

const GetStarted = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className="bg-blue-500 text-white text-sm px-4 py-2 rounded-full hover:bg-blue-600"
    >
      Get Started
    </button>
  );
};

export default GetStarted;
