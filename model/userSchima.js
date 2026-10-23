import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  otp: {
    type: String,
    select: false,
  },

  otpExpiresAt: {
    type: Date,
  },
  
  resetTokenHash: {
  type: String,
  select: false,
},
resetTokenExpiresAt: {
  type: Date,
  select: false,
},


});

// শুধু unverified user মেয়াদ শেষে delete হবে।
userSchema.index(
  { otpExpiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: {
      isVerified: false,
    },
  }
);

export default mongoose.model("UserList", userSchema);