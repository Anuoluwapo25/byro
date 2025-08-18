import { NextResponse } from "next/server";
import { transporter, mailOptions } from "@/lib/mailer";
import { TicketConfirmation } from "@/lib/emails/TicketConfirmation";
import { PayoutRequest } from "@/lib/emails/PayoutRequest";

// Debug: Log the imports
console.log("TicketConfirmation:", TicketConfirmation);
console.log("PayoutRequest:", PayoutRequest);

const emailTemplates = {
  ticket: TicketConfirmation,
  payout: PayoutRequest,
};

export async function POST(request) {
  try {
    const { emails } = await request.json();

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ success: false, error: "No emails provided" }, { status: 400 });
    }

    const results = [];
    for (const { type, to, data } of emails) {
      if (!emailTemplates[type]) {
        results.push({ to, success: false, error: "Unknown email type" });
        continue;
      }

      let template;
      if (type === 'ticket') {
        template = emailTemplates[type](data.name, data.eventDetails);
      } else if (type === 'payout') {
        template = emailTemplates[type](data.name, data.amount);
      }

      try {
        await transporter.sendMail({
          ...mailOptions,
          to,
          subject: template.subject,
          text: template.text,
          html: template.html
        });
        results.push({ to, success: true });
      } catch (error) {
        results.push({ to, success: false, error: error.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Batch email error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
