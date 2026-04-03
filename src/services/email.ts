import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  await resend.emails.send({
    from: "Drink Now <onboarding@resend.dev>",
    to,
    subject: `Your login code: ${code}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 400px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #6C3CE1; margin-bottom: 8px;">Drink Now</h2>
        <p style="color: #555; font-size: 16px;">Your verification code is:</p>
        <div style="background: #F3E8FF; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: 800; color: #6C3CE1; letter-spacing: 8px;">${code}</span>
        </div>
        <p style="color: #888; font-size: 14px;">This code expires in 10 minutes. Don't share it with anyone.</p>
      </div>
    `,
  });
}
