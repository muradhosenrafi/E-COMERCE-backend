import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import User from "../model/userSchima.js";
import { sendPasswordResetEmail } from "../utils/passwordResetEmail.js";

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function forgotPassword(req, res) {
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
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);

    const resetUrl = new URL(
      "/reset-password",
      process.env.FRONTEND_URL,
    );

    resetUrl.hash = new URLSearchParams({ token }).toString();

    // Find the matching account and store its reset token.
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
        await sendPasswordResetEmail({
          email: user.email,
          resetUrl: resetUrl.toString(),
        });
      } catch (error) {
        // Remove only the token belonging to this failed email.
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

        console.error("Password reset email delivery failed:", {
          code: error.code,
          command: error.command,
          responseCode: error.responseCode,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link will be sent.",
    });
  } catch (error) {
    console.error("Password reset request failed:", {
      name: error.name,
      code: error.code,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to process your request. Please try again.",
    });
  }
}

export async function resetPassword(req, res) {
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

    // Consume the valid token and update the password atomically.
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
    console.error("Password reset failed:", {
      name: error.name,
      code: error.code,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to reset your password. Please try again.",
    });
  }
}
