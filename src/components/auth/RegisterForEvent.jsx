import React, { useState } from "react";
import RegisterModal from "./RegisterModal"; // Import the modal

const RegisterForEvent = () => {
  const [isOpen, setIsOpen] = useState(false); // modal open state

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* 👉 Register Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleOpen}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Register Now
          </button>
        </div>
      </div>

      {/* 👇 Modal */}
      <RegisterModal isOpen={isOpen} onClose={handleClose} />
    </div>
  );
};

export default RegisterForEvent;
