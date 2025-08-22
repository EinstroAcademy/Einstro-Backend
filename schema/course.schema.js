const mongoose = require("mongoose");

const courseSchema = mongoose.Schema(
  {
    subjectId: { type: mongoose.Types.ObjectId, ref: "subject" },
    branchId: { type: mongoose.Types.ObjectId, ref: "branch" },
    courseId:{type:String},
    courseId:{type:String},
    title:{type:String,default:""},
    universityId:{type:mongoose.Types.ObjectId, ref: "university" },
    location:{type:String,default:""},
    rank:{type:String,default:""},
    fees:{type:String,default:""},
    duration:{type:String,default:""},
    score:{type:String,default:""},
    description:{type:String,default:""},
    isActive: { type: Boolean, default: true },
    nextIntake:{type:String},
    qualification:{type:String},
    country:{type:String}
  },
  {
    timestamps: true,
    versionKey: false,
  }
); 

const popularCourseSchema = mongoose.Schema(
  {
    name: { type: String },
    image:{type:String},
    isActive:{type:Boolean,default:true}
  },
  {
    timestamps: true,
    versionKey: false,
  }
); 

const Course = mongoose.model('course',courseSchema)
const PopularCourse = mongoose.model('popular_course',popularCourseSchema)

module.exports={Course,PopularCourse}