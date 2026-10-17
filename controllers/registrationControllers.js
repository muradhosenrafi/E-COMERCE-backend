import emailRegex from "../utiles/emailRegex.js";
import passwordRegex from "../utiles/passwordRegex.js";
import userSchema from "../model/userSchima.js";
import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";
import emailSender from "../utiles/emailSender.js";


// this post method
const registionController = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!username) {
      return res.send("username required");
    }
    if (!email) {
      return res.send("email required");
    }
    if (!emailRegex(email)) {
      return res.send("valid email required");
    }
    if (!password) {
      return res.send("password required");
    }
    if (!passwordRegex(password)) {
      return res.send("valid password required");
    }

    const existingUser = await userSchema.findOne({ email });
    if (existingUser) {
      return res.send("email already exists, please login");
    }

    const hash = await bcrypt.hash(password, 10);

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log(otp);

    const otpExpiresAt = new Date(Date.now() + 30 * 1000);

    const data = new userSchema({
      username,
      email,
      password: hash,
      otp,
      otpExpiresAt,
      isVerified: false,
    });

    await data.save();

    // Email পাঠাবে success response দেওয়ার আগে।
    try {
      await emailSender({
        email: data.email,
        username: data.username,
        otp,
        otpExpiresAt: data.otpExpiresAt,
      });
    } catch (mailError) {
      console.error(
        "OTP email error:",
        mailError.code || mailError.message
      );

      // Email ব্যর্থ হলে নতুন pending account সরাবে,
      // যাতে আবার registration করা যায়।
      await userSchema.deleteOne({
        _id: data._id,
        isVerified: false,
      });

      return res.status(502).json({
        success: false,
        message: "Could not send the OTP email. Please try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Verification email sent. Please enter your OTP.",
      email: data.email,
      otpExpiresAt: data.otpExpiresAt,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    console.error(
      "Registration error:",
      error.code || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export default registionController;
