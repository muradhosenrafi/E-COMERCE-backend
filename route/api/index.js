const express = require('express');

const _ = express.Router()
const Registration = require ("./auth/registion.js")

_.use("/authentication",Registration)

module.exports=_