"use client";
import { eventFrame, globeTime, publicSymbol } from "/src/app/assets";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import API from "../../services/api";
// import axiosInstance from "@/utils/axios";

export default function EventCreationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventName, setEventName] = useState("Event Name");
  const [date, setDate] = useState("29-04-2025");
  const [timeFrom, setTimeFrom] = useState("14:00");
  const [timeTo, setTimeTo] = useState("16:00");
  const [physicalLocation, setPhysicalLocation] = useState("");
  const [virtualLink, setVirtualLink] = useState("");
  const [description, setDescription] = useState("");
  const [ticketsTransferable, setTicketsTransferable] = useState(false);
  const [ticketPrice, setTicketPrice] = useState("Free");
  const [capacity, setCapacity] = useState("Unlimited");
  const [eventImage, setEventImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generatedLink, setGeneratedLink] = useState(null);
  const router = useRouter();

  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    if (timeFrom >= timeTo) {
      // Add 1 hour to "Time From" as the default "Time To"
      const [hours, minutes] = timeFrom.split(":");
      const newHours = String(parseInt(hours, 10) + 1).padStart(2, "0");
      setTimeTo(`${newHours}:${minutes}`);
    }
  }, [timeFrom, timeTo]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!eventName.trim()) {
      toast.error("Event name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      // Required fields
      formData.append("name", eventName);
      formData.append("day", date.split("-").reverse().join("-")); // Convert DD-MM-YYYY to YYYY-MM-DD
      formData.append("time_from", convertTo24Hour(timeFrom)); // Convert to 24-hour format
      formData.append("time_to", convertTo24Hour(timeTo)); // Convert to 24-hour format

      // Optional fields
      if (physicalLocation) formData.append("location", physicalLocation);
      if (virtualLink) formData.append("virtual_link", virtualLink);
      if (description) formData.append("description", description);

      // Boolean/Number fields
      formData.append("transferable", ticketsTransferable.toString());
      formData.append(
        "ticket_price",
        ticketPrice === "Free" ? "0.00" : ticketPrice
      );
      formData.append("capacity", capacity === "Unlimited" ? "1000" : capacity);
      formData.append("visibility", "public");
      formData.append("timezone", "GMT+01:00");

      // Image
      if (eventImage) {
        formData.append("image", eventImage, eventImage.name);
      }

      const response = await API.createEvent(formData);
      const eventId = response.data.id;

      setGeneratedLink(`${window.location.origin}/viewevent/${eventId}`);

      // Option 2: Redirect immediately
      // router.push(`/viewevent/${eventId}`);

      toast.success("Event created successfully!");

      // Debug log
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
    } catch (error) {
      console.error("Full error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");

    if (hours === "12") {
      hours = "00";
    }

    if (modifier === "PM") {
      hours = parseInt(hours, 10) + 12;
    }

    return `${hours}:${minutes}:00`;
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-3xl shadow-sm">
      <div>
        {/* Event Name */}
        <div className="flex items-center justify-between mb-8">
          <input
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="text-3xl font-medium text-blue-500 focus:outline-none"
          />

          <div className="flex gap-4">
            {/* Public/Private Toggle */}
            <div className="flex items-center bg-blue-100 px-4 py-2 rounded-full">
              <div className="mr-2">
                <Image src={publicSymbol} alt="globe-time" />
              </div>
              <span className="text-sm text-[#007AFF]">Public</span>
            </div>

            {/* Timezone */}
            <div className="flex items-center bg-blue-100 px-4 py-2 rounded-full">
              <div className="mr-2">
                <Image src={globeTime} alt="globe-time" />
              </div>
              <span className="text-sm text-[#007AFF]">GMT+01:00 Lagos</span>
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="font-medium mb-2 block text-black">Day</label>
            <div className="relative">
              <input
                type="text"
                placeholder="DD-MM-YYYY"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-3 border border-gray-200 rounded-lg pl-10 focus:text-black text-black"
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M8 2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16 2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="font-medium mb-2 block text-black">
              Time - From
            </label>
            <div className="relative">
              <input
                type="time"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
              {/* <div className="absolute right-3 top-4 pointer-events-none">
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div> */}
            </div>
          </div>

          <div>
            <label className="font-medium mb-2 block text-black">
              Time - To
            </label>
            <div className="relative">
              <input
                type="time"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
                min={timeFrom} // Ensures "To" time cannot be earlier than "From" time
                className="w-full p-3 border border-gray-200 rounded-lg"
              />

              {/* <div className="absolute right-3 top-4 pointer-events-none">
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div> */}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="mb-8">
          <label className="font-medium mb-2 block text-black">Location</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Physical location"
                value={physicalLocation}
                onChange={(e) => setPhysicalLocation(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg pl-10 text-black"
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Paste virtual link here"
                value={virtualLink}
                onChange={(e) => setVirtualLink(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg pl-10 text-black"
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 13C11.0945 14.0945 12.4446 14.6361 13.8033 14.6361C15.162 14.6361 16.5121 14.0945 17.6066 13C18.7012 11.9054 19.2427 10.5553 19.2427 9.1967C19.2427 7.83807 18.7012 6.48797 17.6066 5.3934C16.512 4.29883 15.162 3.75736 13.8033 3.75736C12.4446 3.75736 11.0945 4.29883 10 5.3934"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 11C12.9055 9.90548 11.5554 9.36401 10.1967 9.36401C8.83807 9.36401 7.48797 9.90548 6.3934 11C5.29883 12.0946 4.75736 13.4447 4.75736 14.8033C4.75736 16.1619 5.29883 17.512 6.3934 18.6066C7.48797 19.7012 8.83807 20.2426 10.1967 20.2426C11.5554 20.2426 12.9055 19.7012 14 18.6066"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Image */}
        <div className="flex gap-6 mb-8">
          <div className="flex-1">
            <label className="font-medium mb-2 block text-black">
              Description
            </label>
            <div className="relative">
              <textarea
                placeholder="Tell us about the event"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg pl-10 h-16 text-black"
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 5H21M3 12H21M3 19H12"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-40">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            <div
              onClick={handleImageClick}
              className="h-40 rounded-lg flex flex-col items-center justify-center text-white cursor-pointer overflow-hidden"
              style={{
                background: imagePreview
                  ? `url(${imagePreview}) center/cover no-repeat`
                  : "linear-gradient(to bottom, #DBEAFE, #3B82F6)",
              }}
            >
              {!imagePreview && (
                <>
                  <div className="mb-1">
                    <Image src={eventFrame} alt="avatar" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Event Options */}
        <div className="mb-8">
          <label className="font-medium mb-2 block text-black">
            Event Options
          </label>
          <p className="text-xs text-gray-500 mb-4">
            *All transactions must be made using USDC on Base network*
          </p>

          <div className="space-y-4">
            {/* Ticket Price */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-gray-400 mr-3">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 10V14C2 16 3 17 5 17H6.5C7.33 17 8 17.67 8 18.5C8 19.33 7.33 20 6.5 20H5M13 17H19C21 17 22 16 22 14V10C22 8 21 7 19 7H13C11 7 10 8 10 10V14C10 16 11 17 13 17ZM15.5 13.5C16.3284 13.5 17 12.8284 17 12C17 11.1716 16.3284 10.5 15.5 10.5C14.6716 10.5 14 11.1716 14 12C14 12.8284 14.6716 13.5 15.5 13.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.5 7C7.33 7 8 6.33 8 5.5C8 4.67 7.33 4 6.5 4H5C3 4 2 5 2 7V8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-gray-600">Set Ticket Price</span>
              </div>
              <div className="flex items-center">
                <select
                  className="p-2 rounded mr-2"
                  value={ticketPrice === "Free" ? "Free" : "Paid"}
                  onChange={(e) => {
                    if (e.target.value === "Free") {
                      setTicketPrice("Free");
                    } else {
                      setTicketPrice("0.00");
                    }
                  }}
                >
                  <option className="text-black" value="Free">
                    Free
                  </option>
                  <option className="text-black" value="Paid">
                    Paid
                  </option>
                </select>
                {ticketPrice !== "Free" && (
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      className="p-2 border border-gray-200 rounded w-24 pl-6 text-black"
                    />
                    <span className="absolute left-2 top-2 text-gray-500">
                      $
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Transferable Tickets */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="mr-3 text-gray-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 11L11 14L16 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-gray-600">
                  Should Tickets be transferable?
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={ticketsTransferable}
                  onChange={() => setTicketsTransferable(!ticketsTransferable)}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* Capacity */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-gray-400 mr-3">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 8C17 10.2091 15.2091 12 13 12C10.7909 12 9 10.2091 9 8C9 5.79086 10.7909 4 13 4C15.2091 4 17 5.79086 17 8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1 20.5C1 17.6 3.4 14 9 14C14.6 14 17 17.6 17 20.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M19 8H25"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M22 5V11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="text-gray-600">Capacity</span>
              </div>
              <div className="flex items-center">
                <select
                  className="p-2  rounded mr-2"
                  value={capacity === "Unlimited" ? "Unlimited" : "Limited"}
                  onChange={(e) => {
                    if (e.target.value === "Unlimited") {
                      setCapacity("Unlimited");
                    } else {
                      setCapacity("100");
                    }
                  }}
                >
                  <option value="Unlimited">Unlimited</option>
                  <option value="Limited">Limited</option>
                </select>
                {capacity !== "Unlimited" && (
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="p-2 border border-gray-200 rounded w-24"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`bg-gradient-to-r from-[#63D0A5] to-[#16B979] text-white font-medium py-3 px-8 rounded-full transition-colors ${
              isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-green-500"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </button>
        </div>
      </div>

      {generatedLink && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Your Event Link:</h3>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 p-2 border border-blue-200 rounded-l-lg bg-white text-black"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  toast.success("Link copied to clipboard!");
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
            <a
              href={generatedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white text-center py-2 px-4 rounded-lg hover:bg-green-600"
            >
              View Event Page
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
