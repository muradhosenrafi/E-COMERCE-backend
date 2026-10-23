import userSchema from "../model/userSchima.js";

const otpControllers = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "email and otp required",
      });
    }

    const user = await userSchema.findOne({ email }).select("+otp");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or OTP expired. Please register again.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified. Please login.",
      });
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please register again.",
      });
    }

    if (user.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("OTP error:", error.code || error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default otpControllers;