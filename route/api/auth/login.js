import express from "express";
import loginController from "../../../controllers/loginControllers.js";

const _ = express.Router();

_.post("/login", loginController);

export default _;