import emailRegex from "../utiles/emailRegex.js";
import passwordRegex from "../utiles/passwordRegex.js";
import userSchema from "../model/userSchima.js";
import bcrypt from "bcrypt";

// this post method
const loginController = async (req, res) => {
  let { email, password } = req.body;
  if (!email) {
    res.send("email required");
  } else if (!emailRegex(email)) {
    res.send("valid email required");
  } else if (!password) {
    res.send("password required");
  } else if (!passwordRegex(password)) {
    res.send("valid password required");
  } else {
   let data = await userSchema.find({email:email})
  if(data.length>0){
  console.log("login data");
  
  }else{

    res.send({error:"ivalite cardintional"})
  }
   

  }
};

export default loginController;