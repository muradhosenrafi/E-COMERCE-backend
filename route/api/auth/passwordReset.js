import "dotenv/config";
import express from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { rateLimit } from "express-rate-limit";
import User from "../../../model/userSchima.js";

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ""),
  },
});

const genericMessage =
  "If an account exists with this email, a password reset link will be sent.";

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

// Request a password reset link.
router.post("/forgot-password", forgotLimiter, async (req, res) => {
  res.set("Cache-Control", "no-store");

  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address.",
    });
  }

  try {
    const frontendUrl = process.env.FRONTEND_URL?.trim();

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is missing in backend .env");
    }

    if (
      !process.env.GMAIL_USER ||
      !process.env.GMAIL_APP_PASSWORD?.trim()
    ) {
      throw new Error(
        "GMAIL_USER or GMAIL_APP_PASSWORD is missing in backend .env",
      );
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);

    const resetUrl = new URL("/reset-password", frontendUrl);

    if (!["http:", "https:"].includes(resetUrl.protocol)) {
      throw new Error("FRONTEND_URL must use http or https");
    }

    resetUrl.hash = new URLSearchParams({ token }).toString();

    // Check the email and store a reset token for that account.
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          resetTokenHash: tokenHash,
          resetTokenExpiresAt: new Date(
            Date.now() + 15 * 60 * 1000,
          ),
        },
      },
      { new: true },
    )
      .select("_id email")
      .lean();

    if (user) {
      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: user.email,
          subject: "ARMANE — Reset your password",

          text: [
            "Reset your ARMANE password using this link:",
            resetUrl.toString(),
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
                  href="${resetUrl.toString()}"
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
      } catch (error) {
        // Remove only this request's token if email delivery fails.
        await User.updateOne(
          {
            _id: user._id,
            resetTokenHash: tokenHash,
          },
          {
            $unset: {
              resetTokenHash: "",
              resetTokenExpiresAt: "",
            },
          },
        );

        console.error("RESET_EMAIL_DELIVERY_ERROR:", {
          code: error.code,
          command: error.command,
          responseCode: error.responseCode,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", {
      file: import.meta.url,
      name: error.name,
      message: error.message,
      code: error.code,
      frontendUrlConfigured: Boolean(
        process.env.FRONTEND_URL?.trim(),
      ),
    });

    return res.status(500).json({
      success: false,
      message: "Unable to process your request. Please try again.",
    });
  }
});

// Set the new password using a valid reset token.
router.post("/reset-password", resetLimiter, async (req, res) => {
  res.set("Cache-Control", "no-store");

  const { token, password, confirmPassword } = req.body || {};

  if (
    typeof token !== "string" ||
    !/^[a-f0-9]{64}$/.test(token)
  ) {
    return res.status(400).json({
      success: false,
      message: "This reset link is invalid or has expired.",
    });
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Use at least 8 characters. Password must not exceed 72 UTF-8 bytes.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match.",
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    // Update the password and remove the token in one operation.
    const user = await User.findOneAndUpdate(
      {
        resetTokenHash: hashToken(token),
        resetTokenExpiresAt: { $gt: new Date() },
      },
      {
        $set: {
          password: passwordHash,
        },
        $unset: {
          resetTokenHash: "",
          resetTokenExpiresAt: "",
        },
      },
      { new: true },
    )
      .select("_id")
      .lean();

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "This reset link is invalid or has expired. Request a new link.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can log in now.",
    });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", {
      name: error.name,
      message: error.message,
      code: error.code,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to reset your password. Please try again.",
    });
  }
});

export default router;