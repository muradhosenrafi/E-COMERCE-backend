const emailRegex = require("../utiles/emailRegex");
const passwordRegex = require("../utiles/passwordRegex");
const userSchema = require("../model/userSchima");

// this post method
const registionController = async (req, res) => {
  let { username, email, password } = req.body;
  if (!username) {
    res.send("username required");
  } else if (!email) {
    res.send("email required");
  } else if (!emailRegex(email)) {
    res.send("valid email required");
  } else if (!password) {
    res.send("password required");
  } else if (!passwordRegex(password)) {
    res.send(" valid password required");
  } else {
    console.log(req.body);

    let existiguser = await userSchema.find({email:email});

    if (existiguser.length > 0) {
      console.log("plz login");
    } else {
      const data = new userSchema({
        username,
        email,
        password,
      });
      data.save()
      res.send(data)
    }
  }
};
module.exports = registionController;
