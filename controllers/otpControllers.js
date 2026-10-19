
import userSchema from "../model/userSchima.js";


const otpControllers = async (req, res) => {

    const { otp,email } = req.body;

    let existingdata = await userSchema.find({
    eamil:email
    })
    console.log(existingdata[0].otp);
    

  
};

export default otpControllers;