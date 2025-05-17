import React from "react";


const RegisterButton = ({ onClick }) => {
  return (
    <button
    onClick={onClick}
    aria-label="Register"
      type="submit"
      className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      Register
    </button>
  );
};

export default RegisterButton;
