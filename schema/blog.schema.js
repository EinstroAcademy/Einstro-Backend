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
    routeId:{type:String},
    createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "createdByModel",
        },
        createdByModel: {
          type: String,
          required: true,
          enum: ["admin", "sub_admin"],
        },
  },
  {
    timestamps: true,
    versionKey: false,
  }
); 


const Blog =mongoose.model('blog',blogSchema)

module.exports=Blog