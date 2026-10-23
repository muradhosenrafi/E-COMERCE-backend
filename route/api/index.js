import express from "express";
import Registration from "./auth/registion.js";
import Login from "./auth/login.js";
import Otp from "./auth/otp.js"
import passwordResetRoutes from "./auth/passwordReset.js";



const _ = express.Router();

_.use("/authentication", Registration);
_.use("/authentication", Login);
_.use("/authentication",Otp);
_.use("/authentication", passwordResetRoutes);

export default _;