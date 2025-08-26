export const TicketConfirmation = (name, date, time, location, eventDetails) => {
  return {
    subject: "Here is your Ticket!",
    text: `Hi ${name},\n\nThank you for your purchase! Here are your ticket details:\n\n${eventDetails}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
      <h1>Here is your ticket</h1>
      <div>
        <h2>Event Details</h2>
        <p>Here are your ticket details:</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Location:</strong> ${location}</p>
      </div>
        
      </div>
    `
  };
};


