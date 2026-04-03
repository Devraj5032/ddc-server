import nodemailer from "nodemailer";
import net from "net";
import dotenv from "dotenv";

dotenv.config();

// Force IPv4 connection — Render free tier blocks IPv6 outbound
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  // Force IPv4 socket
  connection: undefined,
  tls: {
    rejectUnauthorized: false,
  },
  // Custom socket factory that forces IPv4
  customTransport: undefined,
} as any);

// Override the socket creation to force IPv4
const origConnect = (transporter as any).transporter?._connect;
if (origConnect) {
  (transporter as any).transporter._connect = function (this: any, ...args: any[]) {
    if (args[0]) args[0].family = 4;
    return origConnect.apply(this, args);
  };
}

// Alternative: directly resolve Gmail SMTP to IPv4 and use that
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

// Fallback: create transporter with resolved IPv4 address
async function getIPv4Transporter() {
  return new Promise<nodemailer.Transporter>((resolve, reject) => {
    dns.resolve4("smtp.gmail.com", (err, addresses) => {
      if (err || !addresses.length) {
        // Fallback to hostname
        resolve(transporter);
        return;
      }
      const ipv4Transport = nodemailer.createTransport({
        host: addresses[0], // Use direct IPv4 address
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
          servername: "smtp.gmail.com", // Required for TLS with IP
        },
      });
      resolve(ipv4Transport);
    });
  });
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const transport = await getIPv4Transporter();

  await transport.sendMail({
    from: `"Drink Now" <${process.env.GMAIL_USER}>`,
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
