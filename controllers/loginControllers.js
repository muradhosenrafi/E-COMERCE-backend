import emailRegex from "../utiles/emailRegex.js";
import passwordRegex from "../utiles/passwordRegex.js";
import userSchema from "../model/userSchima.js";
import bcrypt from "bcrypt";

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!emailRegex(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (!passwordRegex(password)) {
      return res.status(400).json({ message: "Valid password is required" });
    }

    // email database e ache kina check
    const user = await userSchema.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Email not found. Please register first." });
    }

    // password match kora
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    // login successful
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

export default loginController;