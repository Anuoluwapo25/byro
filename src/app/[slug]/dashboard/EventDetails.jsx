import API from "../../../services/api";
import { use } from "react";
import { useState, useEffect } from "react";
import { Schedule, Location } from "../../../app/assets";
import Image from "next/image";
import { Link, ExternalLink, Edit3 } from "lucide-react";

export default function EventDetails({ params }) {
  const { slug } = use(params);
  const [event, setEvent] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const data = await API.getEvent(slug);
        setEvent(data);
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    }
    if (slug) fetchEvent();
  }, [slug]);

  const handleCopyLink = async () => {
    const eventLink = `${window.location.origin}/${event?.slug}`;
    try {
      await navigator.clipboard.writeText(eventLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      // You can add a success state here if needed
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  return (
    <>
      {event ? (
        <div>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 ">
            <div>
              <div className="w-full lg:w-auto">
                <img
                  src={event.event_image}
                  alt={event.name}
                  className="w-full lg:w-[387px] h-[200px] lg:h-[244px] object-cover rounded-lg"
                />
              </div>
              <div className=" mx-auto justify-center">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 transition-colors mx-auto mt-4"
                >
                  <Link className="w-5 h-5" />
                  <span className="font-medium">
                    {copySuccess ? "Link Copied!" : "Copy Event Link"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <div className="bg-[#007AFF26] rounded-lg p-4 lg:p-5 w-full lg:w-[387px] lg:h-[244px] flex flex-col justify-center">
                <div className="flex items-start mb-4">
                  <span className="mt-1 flex-shrink-0">
                    <Image
                      src={Schedule}
                      alt="Schedule Icon"
                      width={40}
                      height={40}
                      className="w-8 h-8 lg:w-[60px] lg:h-[60px]"
                    />
                  </span>
                  <div className="ml-3 lg:ml-2 flex-1">
                    <p className="text-base lg:text-lg font-semibold text-black">
                      {event.day}
                    </p>
                    <p className="text-sm lg:text-base text-black">
                      {event.time_from} to {event.time_to} ({event.timezone})
                    </p>
                  </div>
                </div>

                {/* Location Section */}
                <div className="flex items-start">
                  <span className="mt-1 flex-shrink-0">
                    <Image
                      src={Location}
                      alt="Location Icon"
                      width={40}
                      height={40}
                      className="w-8 h-8 lg:w-[60px] lg:h-[60px]"
                    />
                  </span>
                  <div className="ml-3 lg:ml-2 flex-1">
                    <p className="text-base lg:text-lg font-semibold text-black">
                      {event.location || "Virtual Event"}
                    </p>
                    {event.virtual_link && (
                      <a
                        href={event.virtual_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm lg:text-base"
                      >
                        Join Virtual Event
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <button className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 transition-colors mx-auto mt-4">
                  <Edit3 className="w-5 h-5" />
                  <span className="font-medium">Edit Event</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
       null
      )}
    </>
  );
}
