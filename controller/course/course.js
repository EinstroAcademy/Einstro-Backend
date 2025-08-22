const { response } = require("express");
const { Course, PopularCourse } = require("../../schema/course.schema");
const { Subject, Branch, SubjectBranch, University } = require("../../schema/subject.schema");
const fs = require('fs');
const { promisify } = require('util');
const { default: mongoose } = require("mongoose");
const unlinkAsync = promisify(fs.unlink);

function transformSentence(sentence) {
  const cleanSentence = sentence.replace(/[^\w\s]/g, '');
  const hyphenatedSentence = cleanSentence.split(' ').join('-');
  return hyphenatedSentence;
}


const createSubject =async (req,res)=>{
    try {
        const { name } = req.body;
        let create = await Subject.create({
          name,
        });

        if (!create) {
          return res.json({ status: 0, message: "Subject Not Created" });
        }

        res.json({ status: 1, message: "Subject created" });
    } catch (error) {
        console.log(error)
    }
}

const createBranch =async (req,res)=>{
    try {
        const { name } = req.body;
        let create = await Branch.create({
          name: name,
        });

        if (!create) {
          return res.json({ status: 0, message: "Branch Not Created" });
        }
        res.json({ status: 1, message: "Branch created" });
    } catch (error) {
        console.log(error)
    }
}


const createSubjectBranch =async (req,res)=>{
    try {
        const { subjectId,branches } = req.body;

        if(branches.length<=0){
            return res.json({status:0,message:"No Branches Added"})
        }

        if(!subjectId){
            return res.json({status:0,message:"No Subject Selected"})
        }



        let create = await SubjectBranch.create({
          subjectId:subjectId,
          subBranches:branches
        });

        if(!create){
            return res.json({status:0,message:"Subject Branch Not Created"})
        }

        res.json({status:1,message:"Subject Branch created"})
    } catch (error) {
        console.log(error)
    }
}

const createCourse =async (req,res)=>{
    try {
        const {title,universityId,location,rank,fees,duration,score,description,subjectId,branchId,country,qualification} = req.body;

        let create = await Course.create({
          courseId:transformSentence(title),
          courseId:transformSentence(title),
          title,
          universityId,
          location,
          rank,
          fees,
          duration,
          score,
          description,
          subjectId,
          branchId,
          country,
          qualification
        });

        if(!create){
            return res.json({status:0,message:"Course Not Created"})
        }

        res.json({status:1,message:"Course created"})
    } catch (error) {
        console.log(error)
    }
}

const updateCourse =async (req,res)=>{
    try {
        const {_id,title,universityId,location,rank,fees,duration,score,description,subjectId,branchId,country,qualification} = req.body;

        let update = await Course.findByIdAndUpdate({_id:_id},{$set:{
        title,
          universityId,
          location,
          rank,
          fees,
          duration,
          score,
          description,
          subjectId,
          branchId,
          country,
          qualification,
          courseId:transformSentence(title)
        }});

        if (!update) {
            return res.json({ status: 0, message: "Course Not Updated" });
          }

        res.json({status:1,message:"Course Updated"})
    } catch (error) {
        console.log(error)
    }
}

const removeCourse =async(req,res)=>{
    try {
        const {courseId}=req.body
        if(!courseId){
            return res.json({status:0,message:"Course ID required"})
        }

        const remove = await Course.findByIdAndDelete({_id:courseId})
        if(!remove){
            return res.json({status:0,message:"Course not Removed"})
        }
        res.json({status:1,message:"Course is Removed"})
    } catch (error) {
        console.log(error)
    }
}

const editSubject =async (req,res)=>{
    try {
        const { name,subjectId } = req.body;
        let update = await Subject.findByIdAndUpdate({_id:subjectId},{$set:{name:name}})

        if (!update) {
          return res.json({ status: 0, message: "Subject Not Updated" });
        }

        res.json({ status: 1, message: "Subject Updated" });
    } catch (error) {
        console.log(error)
    }
}


const editBranch =async (req,res)=>{
    try {
        const { name,branchId } = req.body;
        let update = await Branch.findByIdAndUpdate({_id:branchId},{$set:{name:name}})

        if (!update) {
          return res.json({ status: 0, message: "Branch Not Updated" });
        }

        res.json({ status: 1, message: "Branch Updated" });
    } catch (error) {
        console.log(error)
    }
}


const removeSubject =async(req,res)=>{
    try {
        const {subjectId}=req.body
        if(!subjectId){
            return res.json({status:0,message:"Blog ID required"})
        }

        const remove = await Subject.findByIdAndDelete({_id:subjectId})
        if(!remove){
            return res.json({status:0,message:"Subject not Removed"})
        }
        res.json({status:1,message:"Subject is Removed"})
    } catch (error) {
        console.log(error)
    }
}

const removeBranch =async(req,res)=>{
    try {
        const {branchId}=req.body
        if(!branchId){
            return res.json({status:0,message:"Branch ID required"})
        }

        const remove = await Branch.findByIdAndDelete({_id:branchId})
        if(!remove){
            return res.json({status:0,message:"Branch not Removed"})
        }
        res.json({status:1,message:"Branch is Removed"})
    } catch (error) {
        console.log(error)
    }
}



const getAllSubject = async (req, res) => {
    try {
      const { search = '', active = '', fromDate = '', toDate = '', limit = 25, skip = 0 } = req.body;
      let query = [];
  
      if (search !== '') {
        query.push({
          $match: {
            $or: [
              { name: { $regex: search + '.*', $options: 'si' } },
            ]
          }
        });
      }
  
      if (active !== '') {
        query.push({ $match: { isActive: active } });
      }
  
  
      query.push({ $sort: { createdAt: -1 } });
  
      const documentQuery = [
        ...query,
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) },
        {
          $project: {
            name:1,
            createdAt: 1,
            updatedAt: 1,
          }
        }
      ];
  
      const overallQuery = [
        ...query,
        { $count: 'counts' }
      ];
  
      const finalquery = [
        {
          $facet: {
            overall: overallQuery,
            documentdata: documentQuery
          }
        }
      ];
  
      const subjectData = await Subject.aggregate(finalquery);
      let data = subjectData[0].documentdata || [];
      let fullCount = subjectData[0].overall[0] ? subjectData[0].overall[0].counts : 0;
  
      if (data.length > 0) {
        res.json({
          status: 1,
          response: {
            result: data,
            fullcount: fullCount,
            length: data.length,
          }
        });
      } else {
        res.json({
          status: 0,
          response: {
            result: [],
            fullcount: fullCount,
            length: 0,
          }
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 0, message: "Internal server error" });
    }
  };

  const clientSideSubjectList =async(req,res)=>{
    try {
      const allSubject=await Subject.find()
      if(!allSubject){
        return res.json({status:0,message:'No subject found'})
      }
      res.json({status:1,response:allSubject})
    } catch (error) {
      console.log(error)
    }
  }

const clientSideBranchList =async(req,res)=>{
  try {
    const allBranch = Branch.find().sort({name:1})
    if(!allBranch){
     return res.json({status:0,response:{result:[]}})
    }
      res.json({status:1,response:allBranch})
  } catch (error) {
    console.log(error)
  }
}

  const getAllBranch = async (req, res) => {
    try {
      const { search = '', active = '', fromDate = '', toDate = '', limit = 25, skip = 0 } = req.body;
      let query = [];
  
      if (search !== '') {
        query.push({
          $match: {
            $or: [
              { name: { $regex: search + '.*', $options: 'si' } },
            ]
          }
        });
      }
  
      if (active !== '') {
        query.push({ $match: { isActive: active } });
      }
  
  
      query.push({ $sort: { createdAt: -1 } });
  
      const documentQuery = [
        ...query,
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) },
        {
          $project: {
            name:1,
            createdAt: 1,
            updatedAt: 1,
          }
        }
      ];
  
      const overallQuery = [
        ...query,
        { $count: 'counts' }
      ];
  
      const finalquery = [
        {
          $facet: {
            overall: overallQuery,
            documentdata: documentQuery
          }
        }
      ];
  
      const branchData = await Branch.aggregate(finalquery);
      let data = branchData[0].documentdata || [];
      let fullCount = branchData[0].overall[0] ? branchData[0].overall[0].counts : 0;
  
      if (data.length > 0) {
        res.json({
          status: 1,
          response: {
            result: data,
            fullcount: fullCount,
            length: data.length,
          }
        });
      } else {
        res.json({
          status: 0,
          response: {
            result: [],
            fullcount: fullCount,
            length: 0,
          }
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 0, message: "Internal server error" });
    }
  };

  const getAllCourse = async (req, res) => {
    try {
      const { search = '', active = '',country=[],qualification=[],subject=[],fromDate = '', toDate = '', limit = 25, skip = 0 } = req.body;
      let query = [];
  
      if (search !== '') {
        query.push({
          $match: {
            $or: [
              { title: { $regex: search + '.*', $options: 'si' } },
              { university: { $regex: search + '.*', $options: 'si' } },
              { location: { $regex: search + '.*', $options: 'si' } },
              { country: { $regex: search + '.*', $options: 'si' } },
            ]
          }
        });
      }
  
      if (active !== '') {
        query.push({ $match: { isActive: active } });
      }

      if(country?.length>0){
        query.push({ $match: { country: { $in: country } } });
      }

      if(qualification.length>0){
        query.push({ $match: { qualification: { $in: qualification } } });
      }

      query.push({
        $lookup:{
          from: 'universities',
          localField: 'universityId',
          foreignField: '_id',
          as: 'universityDetails'
        },
      },
      {
        $unwind: { path: '$universityDetails', preserveNullAndEmptyArrays: true },
      })

      query.push({
        $lookup:{
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subjectDetails'
        },
      },
      {
        $unwind: { path: '$subjectDetails', preserveNullAndEmptyArrays: true },
      })
  
  
      query.push({ $sort: { createdAt: -1 } });
  
      const documentQuery = [
        ...query,
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) },
        {
          $project: {
            title:1,
            universityId:1,
            universityDetails:1,
            location:1,
            rank:1,
            fees:1,
            duration:1,
            score:1,
            description:1,
            subjectId:1,
            branchId:1,
            country:1,
            qualification:1,
            createdAt: 1,
            updatedAt: 1,
            subjectDetails:1
          }
        }
      ];
  
      const overallQuery = [
        ...query,
        { $count: 'counts' }
      ];
  
      const finalquery = [
        {
          $facet: {
            overall: overallQuery,
            documentdata: documentQuery
          }
        }
      ];
  
      const courseData = await Course.aggregate(finalquery);
      let data = courseData[0].documentdata || [];
      let fullCount = courseData[0].overall[0] ? courseData[0].overall[0].counts : 0;
  
      if (data.length > 0) {
        res.json({
          status: 1,
          response: {
            result: data,
            fullcount: fullCount,
            length: data.length,
          }
        });
      } else {
        res.json({
          status: 0,
          response: {
            result: [],
            fullcount: fullCount,
            length: 0,
          }
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 0, message: "Internal server error" });
    }
  };

  const getCourseDetails = async(req,res)=>{
    try {
      const {courseId,_id}=req.body

      const courseDetails = await Course.findOne({courseId:courseId,_id:_id}).populate('universityId')
      if(!courseDetails){
        return res.json({status:0,message:"Course not found"})
      }
      res.json({status:1,response:courseDetails})
    } catch (error) {
      console.log(error)
    }
  }

const getSubjects = async(req,res)=>{
    try {
        const data = await Subject.find({isActive:{$ne:false}})
        if(!data){
            return res.json({status:0,message:"data not found"})
        }
        res.json({status:1,response:data})
    } catch (error) {
        console.log(error)
    }
}

const getBranches = async(req,res)=>{
    try {
        const data = await Branch.find({isActive:{$ne:false}})
        if(!data){
            return res.json({status:0,message:"data not found"})
        }
        res.json({status:1,response:data})
    } catch (error) {
        console.log(error)
    }
}

const createUniversity = async (req, res) => {
  try {
    const getAttachment = (path, name) => encodeURI(path.substring(2) + name);
    const {
      name,
      country,
      location,
      details,
      students,
      rank,
      costOfLiving,
      cost,
      scholarship,
      requirements,
      intake_month,
      startingFee,
      englishTests,
      acceptanceRate
    } = req.body;

    let images = [];
    if (req.files.images) {
      req.files.images.map((e) => {
        images.push(getAttachment(e.destination, e.filename));
      });
    }

    let uniId = transformSentence(name);
    let currency = JSON.parse(req.body.currency);

    // Safe parse intake_month
    let intakeMonthParsed = [];
    if (intake_month) {
      try {
        intakeMonthParsed = JSON.parse(intake_month);
        if (!Array.isArray(intakeMonthParsed)) intakeMonthParsed = [];
      } catch (e) {
        intakeMonthParsed = [];
      }
    }

    // Safe parse englishTest
    let englishTestParsed = [];
    if (englishTests) {
      try {
        englishTestParsed = JSON.parse(englishTests);
        if (!Array.isArray(englishTestParsed)) englishTestParsed = [];
      } catch (e) {
        englishTestParsed = [];
      }
    }

    let create = await University.create({
      name,
      country,
      location,
      currency,
      uniId,
      images,
      details,
      students,
      rank,
      costOfLiving,
      cost,
      scholarship,
      requirements,
      intake_month: intakeMonthParsed,
      startingFee,
      englishTests: englishTestParsed,
      acceptanceRate
    });

    if (!create) {
      return res.json({ status: 0, message: "University Not Created" });
    }

    res.json({ status: 1, message: "University created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};

const updateUniversity = async (req, res) => {
  try {
    const { _id, name, country, location, details, students, rank, costOfLiving, cost, scholarship, requirements, intake_month, startingFee, englishTests,acceptanceRate} = req.body;
    console.log(englishTests)
    const getAttachment = (path, name) => encodeURI(path.substring(2) + name);

    const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];

    if (removedImages?.length > 0) {

      for (let img of removedImages) {
        try {
          await unlinkAsync(img);
          console.log('Photo removed:', img);
        } catch (err) {
          console.error('Error removing image:', img, err.message);
        }
      }
    }

    let updatedImages = [];
    if (req.body.images) {
      try {
        updatedImages = JSON.parse(req.body.images);
      } catch (e) {
        updatedImages = [];
      }
    }
    let editCurrency = {};
    if (req.body.currency) {
      try {
        editCurrency = JSON.parse(req.body.currency);
      } catch (e) {
        editCurrency = {};
      }
    }
    if (req.files && req.files.newImages && req.files.newImages.length > 0) {
      req.files.newImages.forEach((e) => {
        updatedImages.push(getAttachment(e.destination, e.filename));
      });
    }

    let uniId = transformSentence(name);

    let intakeMonthParsed = [];
    if (intake_month) {
      try {
        intakeMonthParsed = JSON.parse(intake_month);
      } catch (e) {
        intakeMonthParsed = [];
      }
    }
    let englishTestParsed = [];
    if (englishTests) {
      try {
        englishTestParsed = JSON.parse(englishTests);
      } catch (e) {
        englishTestParsed = [];
      }
    }

    let update = await University.findByIdAndUpdate({ _id: _id }, {
      $set: {
        name,
        currency: editCurrency,
        location,
        country,
        uniId,
        rank,
        details,
        students,
        costOfLiving,
        images: updatedImages,
        cost,
        scholarship,
        requirements,
        startingFee,
        intake_month: intakeMonthParsed,
        englishTests: englishTestParsed,
        acceptanceRate
      }
    },
      { upsert: true, new: true });


    if (!update) {
      return res.json({ status: 0, message: "University Not Updated" });
    }

    res.json({ status: 1, message: "University Updated" })
  } catch (error) {
    console.log(error)
  }
}

const removeUniversity =async(req,res)=>{
  try {
      const {universityId}=req.body
      if(!universityId){
          return res.json({status:0,message:"university ID required"})
      }

      const remove = await University.findByIdAndDelete({_id:universityId})
      if(!remove){
          return res.json({status:0,message:"university not Removed"})
      }
      res.json({status:1,message:"Branch is Removed"})
  } catch (error) {
      console.log(error)
  }
}

const getAllUniversity = async (req, res) => {
  try {
    const { search = '', active = '',country,fromDate = '', toDate = '', limit = 25, skip = 0 } = req.body;
    let query = [];

    if (search !== '') {
      query.push({
        $match: {
          $or: [
            { name: { $regex: search + '.*', $options: 'si' } },
            { location: { $regex: search + '.*', $options: 'si' } },
            { country: { $regex: search + '.*', $options: 'si' } },
          ]
        }
      });
    }

    if (active !== '') {
      query.push({ $match: { isActive: active } });
    }

    if(country){
      query.push({ $match: { country: country } });
    }

    


    query.push({ $sort: { createdAt: -1 } });

    const documentQuery = [
      ...query,
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      {
        $project: {
          name:1,
          location:1,
          country:1,
          currency:1,
          createdAt: 1,
          updatedAt: 1,
          images:1,
          students:1,
          rank:1,
          details:1,
          costOfLiving:1,
          cost:1,
          scholarship:1,
          requirements:1,
          intake_month:1,
          startingFee:1,
          englishTests:1,
          acceptanceRate:1
        }
      }
    ];

    const overallQuery = [
      ...query,
      { $count: 'counts' }
    ];

    const finalquery = [
      {
        $facet: {
          overall: overallQuery,
          documentdata: documentQuery
        }
      }
    ];

    const universityData = await University.aggregate(finalquery);
    let data = universityData[0].documentdata || [];
    let fullCount = universityData[0].overall[0] ? universityData[0].overall[0].counts : 0;

    if (data.length > 0) {
      res.json({
        status: 1,
        response: {
          result: data,
          fullcount: fullCount,
          length: data.length,
        }
      });
    } else {
      res.json({
        status: 0,
        response: {
          result: [],
          fullcount: fullCount,
          length: 0,
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 0, message: "Internal server error" });
  }
};

const getUniversities = async(req,res)=>{
  try {
      const data = await University.find({isActive:{$ne:false}})
      if(!data){
          return res.json({status:0,message:"data not found"})
      }
      res.json({status:1,response:data})
  } catch (error) {
      console.log(error)
  }
}

const getUniversityDetails =async(req,res)=>{
  try {
    const {universityId}=req.body
    if(!universityId){
      return res.json({status:0,message:"University Id Required"})
    }

    const getUniversity = await University.findOne({uniId:universityId})
    if(!getUniversity){
      return res.json({status:0,message:"University Not Found"})
    }
    res.json({status:1,response:getUniversity})
  } catch (error) {
    console.log(error)
  }
}

const getAllSearchList = async (req, res) => {
  try {
    const {
      search = '',
      filterBy = '',
      skip = 0,
      destination="",
      qualification="",
      subjectId=''
    } = req.body;

    const searchRegex = { $regex: search, $options: 'i' };

    const [subjectMatches, branchMatches, universityMatches] = await Promise.all([
      Subject.find({ name: searchRegex }),
      Branch.find({ name: searchRegex }),
      University.find({ name: searchRegex }),
    ]);

    const subjectIds = subjectMatches.map(s => s._id);
    const branchIds = branchMatches.map(b => b._id);
    const universityIds = universityMatches.map(u => u._id);

    // Dynamic limits
    const courseLimit = (!filterBy || filterBy === 'courses') ? (filterBy ? 50 : 10) : 0;
    const universityLimit = (!filterBy || filterBy === 'universities') ? (filterBy ? 50 : 10) : 0;
    const subjectLimit = (!filterBy || filterBy === 'subjects') ? (filterBy ? 50 : 10) : 0;

    // Courses Aggregate
    let Coursequery=[
      {
        $lookup: {
          from: 'universities',
          localField: 'universityId',
          foreignField: '_id',
          as: 'universityId'
        }
      },
      { $unwind: { path: '$universityId', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { title: searchRegex },
            { subjectId: { $in: subjectIds } },
            { branchId: { $in: branchIds } },
            { universityId: { $in: universityIds } },
            { "universityId.name": searchRegex },
          ]
        }
      },
      
      { $skip: parseInt(skip) },
      { $limit: courseLimit },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subjectId'
        }
      },
      { $unwind: { path: '$subjectId', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'branches',
          localField: 'branchId',
          foreignField: '_id',
          as: 'branchId'
        }
      },
      { $unwind: { path: '$branchId', preserveNullAndEmptyArrays: true } },
    ]

    if(destination!==""){
      Coursequery.push(
        {
          $match: {
            country:destination
          }
        },
      )
    }

    if(qualification!==""){
      Coursequery.push(
        {
          $match: {
            qualification:qualification
          }
        },
      )
    }

    if(subjectId){
      Coursequery.push(
        {
          $match: {
            'subjectId._id':new mongoose.Types.ObjectId(subjectId)
          }
        },
      )
    }
    const coursePromise = (courseLimit > 0) ? Course.aggregate(Coursequery) : Promise.resolve([]);

    const courseCountPromise = (courseLimit > 0) ? Course.aggregate([
      {
        $lookup: {
          from: 'universities',
          localField: 'universityId',
          foreignField: '_id',
          as: 'universityId'
        }
      },
      { $unwind: { path: '$universityId', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { title: searchRegex },
            { subjectId: { $in: subjectIds } },
            { branchId: { $in: branchIds } },
            { universityId: { $in: universityIds } },
          ]
        }
      },
     
      { $count: 'count' }
    ]).then(result => result[0]?.count || 0) : Promise.resolve(0);

    // Universities Aggregate

    // Build $match object
const universityMatch = {
  $or: [
    { name: searchRegex }
  ]
};



// Final aggregation pipeline
const universityQuery = [
  { $match: universityMatch },
];

if (destination !== "") {
  universityQuery.push({ $match:{
    country: destination
  } });
}

universityQuery.push(
  { $skip: parseInt(skip) },
  { $limit: universityLimit }
)

// Correct aggregate call
const universityPromise = (universityLimit > 0) ? University.aggregate(universityQuery) : Promise.resolve([]);

// CountDocuments query
const universityCountPromise = (universityLimit > 0) ? University.countDocuments(universityMatch) : Promise.resolve(0);

    // Subjects Aggregate
    const subjectPromise = (subjectLimit > 0) ? Subject.find({ name: searchRegex })
      .skip(parseInt(skip))
      .limit(subjectLimit) : Promise.resolve([]);

    const subjectCountPromise = (subjectLimit > 0) ? Subject.countDocuments({ name: searchRegex }) : Promise.resolve(0);

    // Run All in Parallel
    const [courses, courseCount, universities, universityCount, subjects, subjectCount] = await Promise.all([
      coursePromise,
      courseCountPromise,
      universityPromise,
      universityCountPromise,
      subjectPromise,
      subjectCountPromise
    ]);

    const response = {
      courses: courses,
      universities: universities,
      subjects: subjects,
      count: {
        courses: courseCount,
        universities: universityCount,
        subjects: subjectCount,
        total: courseCount + universityCount + subjectCount
      },
      length: {
        courses: courses.length,
        universities: universities.length,
        subjects: subjects.length
      }
    };

    res.json({ status: 1, response });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal server error" });
  }
};








const getUniversityCourseList =async(req,res)=>{
  try {
      const {universityId} =req.body
      const universityDetails = await University.findOne({uniId:universityId})

      if(!universityDetails){
        return res.json({status:0,message:"No University Found"})
      }

      const courseList = await Course.find({universityId:universityDetails._id}).populate('universityId')

      if(!courseList){
        return res.json({status:0,message:"No Course List Found"})
      }

       res.json({status:1,courseList:courseList})
  } catch (error) {
    console.log("getUniversityCourseList",error)
  }
}

const getCountryUniversity = async(req,res)=>{
  try {
    const {country} = req.body

    if(!country){
        return res.json({status:0,message:"Country Required"})
    }

    const countryUni = await University.find({country:country})

    if(!countryUni){
      return res.json({status:0,message:"No university Found"})
    }

    res.json({status:1,response:countryUni})

  } catch (error) {
    console.log(error)
  }
}


// Popular Courses

const createPopularCourse = async (req, res) => {
  try {
    // check name
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ status: 0, message: "Name is required" });
    }

    // check file
    if (!req.files || !req.files.image || req.files.image.length === 0) {
      return res.status(400).json({ status: 0, message: "Image is required" });
    }

    const getAttachment = (path, filename) => encodeURI(path.substring(2) + filename);
    const image = getAttachment(req.files.image[0].destination, req.files.image[0].filename);

    let create = await PopularCourse.create({ name, image });

    if (!create) {
      return res.status(500).json({ status: 0, message: "Popular course not created" });
    }

    res.json({ status: 1, message: "Popular Course created", data: create });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Server error", error: error.message });
  }
};



module.exports = {
  createSubject,
  createBranch,
  createSubjectBranch,
  getAllSubject,
  getAllBranch,
  editSubject,
  editBranch,
  removeSubject,
  removeBranch,
  getSubjects,
  getBranches,
  createCourse,
  getAllCourse,
  getCourseDetails,
  updateCourse,
  removeCourse,
  createUniversity,
  updateUniversity,
  removeUniversity,
  getAllUniversity,
  getUniversities,
  getUniversityDetails,
  clientSideBranchList,
  clientSideSubjectList,
  getAllSearchList,
  getUniversityCourseList,
  getCountryUniversity,
  createPopularCourse
};