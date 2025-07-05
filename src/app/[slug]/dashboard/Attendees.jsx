
import React, {useState} from "react";
import { Trash2 } from "lucide-react";



const Attendees = () => {

  const [attendeesData, setAttendeesData] = useState ([
    {
      id: 1,
      name: "Francis David",
      email: "disual@byro.africa",
      isGoing: true
    },
    {
      id: 2,
      name: "Samuel Ajayi",
      email: "sam@byro.africa",
      isGoing: false
    },
    {
      id: 3,
      name: "Robert Aruleba",
      email: "Robert@byro.africa",
      isGoing: false
    },
    {
      id: 4,
      name: "Temitope",
      email: "Temi@byro.africa",
      isGoing: true
    },

  ])



  return (
    <div>
      <div className="flex">
        {/* main */}
        <div>
          hahha
        </div>

        <div className="flex flex-col space-y-4">
          <button type="submit" text="Invite" className="bg-blue-600 rounded-lg p-2 text-base">
            Invite
          </button>

          <button type="submit" text="Invite" className="bg-blue-600 rounded-lg p-2 text-base">
            Check In
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-10">
        <div>
          <h1 className="text-black font-bold">Attendees</h1>
        </div>

        <div>
          <input
            type="search"
            className="bg-gray-100 p-2 rounded-lg text-black outline-none"
            placeholder="Search for attendee..."
          />
        </div>
      </div>

      <div className="flex flex-col mt-5dn">

        {attendeesData.map( attendee => (
          <div key={attendee.id} className="">
            <div className="flex justify-between flex-row border-b bg-gray-50 p-5">
            
            <h3 className="text-black font-medium">{attendee.name}</h3>
           
           <p className="text-base text-gray-300 text-left">{attendee.email}</p>
             
             <p className="text-blue-300 text-base">{attendee.isGoing ? "Going ": "Not Going"}</p> 
            
            </div>
          
          </div>
        ))}
      </div>


    </div>
  );
};

export default Attendees;
