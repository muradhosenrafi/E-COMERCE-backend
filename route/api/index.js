const express = require('express');

const _ = express.Router()

_.use("/authentication",()=>{
    console.log(" loguidn" );
    
})

module.exports=_