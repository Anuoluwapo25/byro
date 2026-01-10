// ID: event-search-02
"use client";

import { useState } from "react";
import { Search, Calendar } from "lucide-react";

const EventSearch = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col sm:flex-row items-stretch sm:items-center bg-white border border-[#E3E3E1] sm:pr-2 shadow-md rounded-full overflow-hidden"
    >
      {/* Input Section */}
      <div className="flex items-center px-3 sm:px-4 py-3 w-full sm:w-auto sm:flex-grow border-b sm:border-b-0 sm:border-r border-gray-200 gap-2">
        <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Input Event Name"
          className="flex-1 min-w-0 text-[#1e1e1e] px-3 py-2 text-sm outline-none border border-gray-500 rounded-full"
        />
      </div>

      {/* Button */}
      <button
        type="submit"
        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-[#1a1a1a] text-sm font-medium px-6 sm:px-9 py-2.5 sm:py-2 flex items-center justify-center gap-1 rounded-full m-2 sm:m-0 sm:ml-2"
      >
        Search
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
};

export default EventSearch;
