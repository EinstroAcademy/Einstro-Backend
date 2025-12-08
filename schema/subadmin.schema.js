const mongoose = require('mongoose');


const sub_adminSchema = mongoose.Schema(
  {
    employeeName: { type: String },
    email: { type: String },
    password: { type: String },
    photo: { type: String },
    role: { type: String },
    designation:{type:String},
    permissions:[
      {type:String}
    ],
    otp:{type:Number},
    otpTimeStamp:{type:Number},
    otpVerified:{type:Boolean,default:false},
    mobile:{type:String},
    image:{type:String}
  },
  {
    timestamps: true,
    versionKey: false,
  }
); 


const subAdmin =mongoose.model('sub_admin',sub_adminSchema)

module.exports=subAdmin