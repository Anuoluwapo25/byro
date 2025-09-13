// components/Tab.jsx
import React from "react";

const Tab = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-[#fff] text-[#1A1A1A] border border-[#EAEAEA]"
          : "bg-none text-[#999999]"
      }`}
    >
      {label}
    </button>
  );
};

export default Tab;
