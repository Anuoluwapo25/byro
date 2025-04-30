import React from 'react'

const GetStarted = () => {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return (
    <button onClick={handleClick}   className="bg-blue-500 text-white text-smg px-4 py-2 rounded-full hover:bg-blue-600">
      Get Started
    </button>
  );
};

export default GetStarted;
