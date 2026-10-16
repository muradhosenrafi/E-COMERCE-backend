import dns from "node:dns/promises";
import express from "express";
import Authentication from "./api/index.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const _ = express.Router();

_.use(`${process.env.API_URL}`, Authentication);

export default _;