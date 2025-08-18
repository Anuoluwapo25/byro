// components/CreateEventButton.jsx
import React from "react";

const CreateEventButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-6 rounded-full transition-colors"
    >
      Create Event
    </button>
  );
};

export default CreateEventButton;
