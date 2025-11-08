const mongoose = require('mongoose');


const blogSchema = mongoose.Schema(
  {
    title: { type: String },
    image: { type: String },
    type: { type: String },
    doc: { type: String },
    postedOn: { type: Date },
    description: { type: String },
    details: { type: String },
    isActive:{type:Boolean,default:true},
    blogId:{type:String},
    routeId:{type:String}
  },
  {
    timestamps: true,
    versionKey: false,
  }
); 


const Blog =mongoose.model('blog',blogSchema)

module.exports=Blog