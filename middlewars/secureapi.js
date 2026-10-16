const secureapi = (req,res,next)=>{
// console.log(req.headers);
if(req.headers.authorization =="sdfgasdfas3546d464aA"){
    next()
}else{
    res.send({error:"Authorization Failed"})
}
}

module.exports = secureapi