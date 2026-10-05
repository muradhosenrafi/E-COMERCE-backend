const emailRegex= (email)=>{



    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)){
        return true
    }
    

}
module.exports=emailRegex