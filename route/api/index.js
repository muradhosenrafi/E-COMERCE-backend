import express from "express";
import Registration from "./auth/registion.js";
import Login from "./auth/login.js";
import Otp from "./auth/otp.js"

const _ = express.Router();

_.use("/authentication", Registration);
_.use("/authentication", Login);
_.use("/authentication",Otp);

export default _;