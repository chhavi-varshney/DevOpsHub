import nodemailer from "nodemailer";

const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: message,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Email Sent Successfully");

  } catch (error) {
    console.error("❌ Email Error:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;