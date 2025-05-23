import React from "react";

const SignupButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className=" bg-blue-600 hover:bg-blue-700 text-white font-semibold
                     py-2 px-6 rounded-full transition duration-300 ease-in-out
                     shadow-md hover:shadow-lg"
      aria-label="Log in"
    >
      Sign In
    </button>
  );
};

export default SignupButton;
