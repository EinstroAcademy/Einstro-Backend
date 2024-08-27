const mongoose = require('mongoose');


const adminSchema = mongoose.Schema(
  {
    username: { type: String },
    email: { type: String },
    password: { type: String },
    photo: { type: String },
    role: { type: String },
    otp:{type:Number},
    otpTimeStamp:{type:Number},
    otpVerified:{type:Boolean,default:false}
  },
  {
    timestamps: true,
    versionKey: false,
  }
); 


const Admin =mongoose.model('admin',adminSchema)

module.exports=Admin