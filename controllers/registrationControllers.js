import emailRegex from "../utiles/emailRegex.js";
import passwordRegex from "../utiles/passwordRegex.js";
import userSchema from "../model/userSchima.js";
import bcrypt from "bcrypt";

// this post method
const registionController = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!username) {
      return res.send("username required");
    }
    if (!email) {
      return res.send("email required");
    }
    if (!emailRegex(email)) {
      return res.send("valid email required");
    }
    if (!password) {
      return res.send("password required");
    }
    if (!passwordRegex(password)) {
      return res.send("valid password required");
    }

    const existingUser = await userSchema.findOne({ email });
    if (existingUser) {
      return res.send("email already exists, please login");
    }

    const hash = await bcrypt.hash(password, 10);

    const data = new userSchema({
      username,
      email,
      password: hash,
    });

    await data.save();
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
};

export default registionController;