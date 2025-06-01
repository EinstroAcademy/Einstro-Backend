const mongoose = require('mongoose');


const userSchema = mongoose.Schema(
  {
    username: { type: String },
    firstName:{type: String},
    lastName:{type: String},
    fullName:{type:String},
    email: { type: String},
    password: { type: String },
    photo: { type: String },
    role: { type: String },
    otp:{type:Number},
    otpTimeStamp:{type:Number},
    otpVerified:{type:Boolean,default:false},
    mobile:{type:String},
    image:{type:String},
    city:{type:String},
    nationality:{type:String},
    dob:{type:String},
    country:{type:String},
    qualification:{
      degree:{type:String},
      country:{type:String},
      university:{type:String},
      cgpa_level:{type:String},
      score:{type:String},
    },
    school12th:{
      school: { type: String },
      boardOfEducation: { type: String },
      mediumOfInstruction: { type: String },
      yearsOfPassing: { type: String },
      subjectStudied: { type: String },
      totalMarks: { type: String },
      marksObtained: { type: String },
      percentage: { type: String }
    },
    englishTest:{
      test:{type:String},
      overallScore:{type:String},
      listening:{type:String},
      reading:{type:String},
      speaking:{type:String},
      writing:{type:String},
    },
    preferred:{
      destination:{type:String},
      degree:{type:String},
      start_year:{type:String},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
); 


const User =mongoose.model('user',userSchema)

module.exports=User