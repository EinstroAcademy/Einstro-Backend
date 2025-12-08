const mongoose = require("mongoose");

const abroadSchema = mongoose.Schema(
  {
    country_name:{type:String},
    country_img:{type:String},
    header: {
      content_side: { type: String },
      head_img: { type: String },
      content: { type: String },
      main_head: { type: String },
    },
    country_note: {
      world_rank: { type: String },
      graduate_visa: { type: String },
      annual_fee: { type: String },
      scholarship: { type: String },
      international_std: { type: String },
    },
    second_header: {
      content_side: { type: String },
      sec_img: { type: String },
      content: { type: String },
      main_head: { type: String },
    },
    admissions_requirements: {
      heading: { type: String },
      content: { type: String },
    },
    intake: {
      heading: { type: String },
      content: { type: String },
    },
    cost: {
      heading: { type: String },
      content: { type: String },
    },
    visa_requirements: {
      heading: { type: String },
      content: { type: String },
    },
    scholarship: {
      heading: { type: String },
      content: { type: String },
    },
    work_visa: {
      heading: { type: String },
      content: { type: String },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel",
    },
    createdByModel: {
      type: String,
      required: true,
      enum: ["admin", "sub_admin"],
    },
    route_id:{type:String}
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Abroad = mongoose.model("abroad", abroadSchema);

module.exports = Abroad;
