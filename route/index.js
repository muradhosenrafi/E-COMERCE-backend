const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express');

const _ = express.Router()
const Authentication = require ("./api/index")

_.use("/api/v1",Authentication)

module.exports=_