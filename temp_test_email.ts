import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ''),
  },
});

async function test() {
  console.log("Testing email with:", process.env.GMAIL_USER);
  console.log("Password length:", process.env.GMAIL_APP_PASSWORD?.length);
  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: "Test Email from Kanji Explorer",
      text: "Jika kamu menerima email ini, berarti settingan email sudah benar!",
    });
    console.log("SUCCESS! Message sent: %s", info.messageId);
  } catch (error) {
    console.error("FAILED to send email:", error);
  }
}

test();
