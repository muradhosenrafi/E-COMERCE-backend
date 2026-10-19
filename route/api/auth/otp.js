import express from "express";
import otpControllers from "../../../controllers/otpControllers.js";
const _ = express.Router();



_.post("/otp",otpControllers);

export default _;