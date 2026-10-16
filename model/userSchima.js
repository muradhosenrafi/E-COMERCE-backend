import mongoose from "mongoose";
const {Schema}=mongoose

const userSchema=new Schema({
    username:{
        type:String,
        require:true

    },
    email:{
        type:String,
        require:true

    },
    password:{
        type:String,
        require:true

    },
})

export default mongoose.model("UserList", userSchema);