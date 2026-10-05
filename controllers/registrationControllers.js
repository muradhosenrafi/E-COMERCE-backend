const emailRegex = require("../utiles/emailRegex")
const passwordRegex = require("../utiles/passwordRegex")

// this post method 
const registionController= (req,res)=>{
    let {username,email,password}=req.body
    if(!username){
        res.send("username required")
    }else if (!email){
        res.send("email required")


    }else if(!emailRegex(email)) {
   res.send("valid email required");
  
    }
    
    else if (!password){
        res.send("password required")
    }else if(!passwordRegex(password)){
        res.send(" valid password required")
    }
    else{
        console.log(req.body);
        
    }
    

}
module.exports=registionController