const mongoose = require('mongoose');


const serialSchema = mongoose.Schema(
  {
    serial:{type:Number,default:1001}
  },
  {
    timestamps: true,
    versionKey: false,
  }
); 


const Serial =mongoose.model('serial',serialSchema)

module.exports=Serial