const express = require('express');

const _ = express.Router()
const Authentication = require('./api/index')

_.use("/api/v1/",Authentication)

module.exports=_