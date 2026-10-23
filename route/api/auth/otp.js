import express from "express";
import otpControllers from "../../../controllers/otpControllers.js";
const _ = express.Router();



_.post("/verify-otp",otpControllers);

export default _;