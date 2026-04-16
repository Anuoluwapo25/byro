export function welcomeEmail(name) {
  return {
    subject: "Welcome to My App!",
    text: `Hi ${name},\n\nWelcome to My App! We’re excited to have you with us.\n\nEnjoy exploring!`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1>Hello, ${name}!</h1>
        <p>We’re excited to have you on board. 🎉</p>
        <p>Enjoy exploring our platform!</p>
      </div>
    `
  };
}
