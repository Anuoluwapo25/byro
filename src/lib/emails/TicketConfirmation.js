export const TicketConfirmation = (name, eventDetails) => {
  return {
    subject: "Here is your Ticket",
    text: `Hi ${name},\n\nThank you for your purchase! Here are your ticket details:\n\n${eventDetails}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1>Thank you for your purchase, ${name}!</h1>
        <p>Here are your ticket details:</p>
        <pre>${eventDetails}</pre>
      </div>
    `
  };
};

// export default TicketConfirmation;
