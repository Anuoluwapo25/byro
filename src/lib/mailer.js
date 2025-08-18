import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// transporter.verify((error, success) => {
//   if (error) {
//     console.error("Error connecting to mail server:", error);
//   } else {
//     console.log("Mail server is ready to take messages");
//   }
// });

export const mailOptions = {
  from: `Byro Africa <${process.env.SMTP_FROM_EMAIL}>`
};
