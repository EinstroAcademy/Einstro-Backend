const mongoose = require('mongoose');


const SubjectSchema = mongoose.Schema(
  {
    name: { type: String },
    isActive:{type:Boolean,default:true}
  },
  {
    timestamps: true,
    versionKey: false,
  }
); 

const branchesSchema = mongoose.Schema(
    {
        name: { type: String },
        isActive:{type:Boolean,default:true}
      },
      {
        timestamps: true,
        versionKey: false,
      } 
);

const SubjectBranchSchema = mongoose.Schema(
    {
      subjectId: { type: mongoose.Types.ObjectId,ref:'subject' },
      subBranches:[{type:String}],
      isActive:{type:Boolean,default:true}
    },
    {
      timestamps: true,
      versionKey: false,
    }
  ); 

const universitySchema =mongoose.Schema(
  {
      name: { type: String },
      location:{type:String},
      country:{type:String},
      uniId:{type:String},
      rank:{type:String},
      students:{type:String},
      costOfLiving:{type:String},
      startingFee:{type:String},
      englishTests:[{type:String}],
      acceptanceRate:{type:String},
      currency:{
        country:{type:String},
        symbol:{type:String},
        code:{type:String},
        name:{type:String}
      },
      images:[String],
      isActive:{type:Boolean,default:true},
      details:{type:String},
      cost:{type:String},
      scholarship:{type:String},
      requirements:{type:String},
      intake_month:[
        {type:String}
      ]
    },
    {
      timestamps: true,
      versionKey: false,
    } 
);


const Subject =mongoose.model('subject',SubjectSchema)
const Branch = mongoose.model('branch',branchesSchema)
const SubjectBranch = mongoose.model('subject_branch',SubjectBranchSchema)
const University =mongoose.model('university',universitySchema)

module.exports={Subject,Branch,SubjectBranch,University}