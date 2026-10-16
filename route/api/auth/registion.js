import express from "express";
import registrationController from "../../../controllers/registrationControllers.js";

const _ = express.Router();

_.post("/registration", registrationController);

export default _;