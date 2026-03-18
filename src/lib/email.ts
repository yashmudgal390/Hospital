import { render } from "@react-email/components";
import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;
const smtpSecure = process.env.SMTP_SECURE === "true";
const fromName = process.env.SMTP_FROM_NAME || "Dr. Clinic Website";
const fromEmail = process.env.SMTP_FROM_EMAIL || "no-reply@clinic.com";

export const adminNotifyEmail = process.env.ADMIN_NOTIFY_EMAIL;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement; // The React Email component
}

/**
 * Renders a React Email template to an HTML string and sends it via SMTP.
 */
export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn(
      "[email] SMTP env vars missing. Email NOT sent to:",
      to,
      "| Subject:",
      subject
    );
    return false;
  }

  try {
    const html = await render(react);

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    console.log(`[email] Sent message: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[email] Failed to send email:", error);
    return false;
  }
}
