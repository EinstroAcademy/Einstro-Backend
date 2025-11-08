const mongoose = require('mongoose');

const settingSchema = mongoose.Schema(
  {
   setting_name:{type:String},
   content:{type:String},
   settingId:{type:String}
  },
  {
    timestamps: true,
    versionKey: false,
  }
); 

const Setting =mongoose.model('setting',settingSchema)
module.exports=Setting

