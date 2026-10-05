const express = require("express");
const registionController = require("../../../controllers/registrationControllers");
const _ = express.Router();


_.post("/registion",registionController);

module.exports = _ ;