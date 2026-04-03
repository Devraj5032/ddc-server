import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: `"Daily Drink Companion" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Your login code: ${code}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 400px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #6C3CE1; margin-bottom: 8px;">Daily Drink Companion</h2>
        <p style="color: #555; font-size: 16px;">Your verification code is:</p>
        <div style="background: #F3E8FF; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: 800; color: #6C3CE1; letter-spacing: 8px;">${code}</span>
        </div>
        <p style="color: #888; font-size: 14px;">This code expires in 10 minutes. Don't share it with anyone.</p>
      </div>
    `,
  });
}
