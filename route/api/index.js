import express from "express";
import Registration from "./auth/registion.js";
import Login from "./auth/login.js";

const _ = express.Router();

_.use("/authentication", Registration);
_.use("/authentication", Login);

export default _;