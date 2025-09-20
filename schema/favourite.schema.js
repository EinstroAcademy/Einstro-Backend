const mongoose = require("mongoose");

const favouriteSchema = mongoose.Schema(
  {
    courseId:{type:mongoose.Types.ObjectId, ref: "course" },
    universityId:{type:mongoose.Types.ObjectId, ref: "university" },
    userId:{type:mongoose.Types.ObjectId, ref: "user" },
    isFavourite:{type:Boolean}
  },
  {
    timestamps: true,
    versionKey: false,
  }
); 

const Favourite =mongoose.model('favourite',favouriteSchema)

module.exports=Favourite