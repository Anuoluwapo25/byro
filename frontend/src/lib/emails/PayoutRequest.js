export const PayoutRequest = (name, amount, eventName) => {
  return {
    subject: "Payout Request Recieved",
    text: `Hi ${name},\n\nYou have requested a payout of ${amount}.\n\nThank you!`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Hi ${name},</p>
        <p>We hope you're doing great!</p>
        <p>We're pleased to confirm that we've received your payout request for the event ${eventName}. The requested amount of ${amount} will be processed within the next 24 hours.</p>
        <p>If you have any questions or need further assistance, feel free to reach out to us.</p>
        <p>Thank you for using our platform!</p>
        <p>Best regards,</p>
        <p>Byro Africa Team</p>
      </div>
    `
  };
};

// export default PayoutRequest;





