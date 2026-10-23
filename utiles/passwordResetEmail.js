import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail({ email, resetUrl }) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: "ARMANE — Reset your password",

    text: [
      "Reset your ARMANE password using this link:",
      resetUrl,
      "",
      "This link expires in 15 minutes and can be used once.",
      "If you did not request this, ignore this email.",
    ].join("\n"),

    html: `
      <div style="background:#090b14;padding:32px 16px;font-family:Arial,sans-serif;">
        <div style="max-width:480px;margin:auto;background:#141625;border:1px solid #303047;border-radius:20px;padding:32px;">
          <h2 style="color:#c4b5fd;margin:0 0 24px;">
            ARMANE
          </h2>

          <h1 style="color:#ffffff;font-size:26px;margin:0 0 16px;">
            Reset your password
          </h1>

          <p style="color:#b0b7c8;font-size:14px;line-height:24px;">
            We received a request to reset your password.
            Click the button below to choose a new password.
          </p>

          <a
            href="${resetUrl}"
            style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:15px 24px;border-radius:10px;font-size:14px;font-weight:bold;margin:16px 0;"
          >
            Reset password
          </a>

          <p style="color:#b0b7c8;font-size:13px;line-height:22px;">
            This link expires in 15 minutes and can be used once.
          </p>

          <p style="color:#8991a5;font-size:12px;line-height:22px;">
            If you did not request this, ignore this email.
            Your password will stay the same.
          </p>
        </div>
      </div>
    `,
  });
}