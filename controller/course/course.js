const { response } = require("express");
const { Course, PopularCourse } = require("../../schema/course.schema");
const { Subject, Branch, SubjectBranch, University } = require("../../schema/subject.schema");
const fs = require('fs');
const { promisify } = require('util');
const { default: mongoose } = require("mongoose");
const Favourite = require("../../schema/favourite.schema");
const User = require("../../schema/user.schema");
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
          qualification,
          createdBy:req.params.mainAdminId
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
    const allBranch =await Branch.find().sort({name:1})
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
      const { search = '', active = '',country=[],qualification=[],subject=[],university='',fromDate = '', toDate = '', limit = 25, skip = 0 } = req.body;
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

      if (university !== "") {
        query.push({
          $match: { universityId: new mongoose.Types.ObjectId(university) }
        });
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
  console.log(req.files)
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
      acceptanceRate,
      
    } = req.body;

    let images = [];
    if (req.files.images) {
      req.files.images.map((e) => {
        images.push(getAttachment(e.destination, e.filename));
      });
    }


     let icon = "";
    if (req.files?.icon && req.files.icon.length > 0) {
      const e = req.files.icon[0];
      icon = getAttachment(e.destination, e.filename);
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
      icon,
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
      acceptanceRate,
      createdBy:req.params.mainAdminId
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
  console.log(req.files.icon)
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

     let icon = "";
    if (req.files?.icon && req.files.icon.length > 0) {
      const e = req.files.icon[0];
      icon = getAttachment(e.destination, e.filename);
    }else{
      icon = req.body.icon
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
        acceptanceRate,
        icon
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
          acceptanceRate:1,
          icon:1
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

const getAllUniversities = async (req, res) => {
  try {
    const {
      search = '',
      destination = '',
      studyLevel = '',
      university = '',
      fees = '',
      skip = 0,
      limit = 10
    } = req.body;

    const searchRegex = { $regex: search, $options: 'i' };

    // ---------- Base Match Stage ----------
    const matchStage = { $or: [{ name: searchRegex }] };

    const query = [{ $match: matchStage }];

    if (destination) query.push({ $match: { country: destination } });
    if (studyLevel) query.push({ $match: { qualification: studyLevel } });
    if (university) query.push({ $match: { _id: new mongoose.Types.ObjectId(university) } });

    if (fees) {
      const [minFee, maxFee] = fees.split("-").map(f => parseInt(f));
      query.push(
        {
          $addFields: {
            feesNumeric: {
              $toInt: { $replaceAll: { input: "$startingFee", find: ",", replacement: "" } }
            }
          }
        },
        { $match: { feesNumeric: { $gte: minFee, $lte: maxFee } } }
      );
    }

    // ---------- Lookup Courses & Add Counts ----------
    query.push(
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'universityId',
          as: 'courses'
        }
      },
      {
        $addFields: {
          courseCount: { $size: "$courses" },
          numericRank: {
            $cond: [
              { $regexMatch: { input: "$rank", regex: /^[0-9]+$/ } },
              { $toInt: "$rank" },
              null
            ]
    }
        }
      },
      { $sort: { numericRank: 1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) }
    );

    // ---------- Main Query ----------
    const universities = await University.aggregate(query);

    // ---------- Count of Filtered Universities ----------
    const countQuery = [
      { $match: matchStage },
      ...(destination ? [{ $match: { country: destination } }] : []),
      ...(studyLevel ? [{ $match: { qualification: studyLevel } }] : []),
      ...(university ? [{ $match: { _id: new mongoose.Types.ObjectId(university) } }] : []),
      ...(fees ? [
        {
          $addFields: {
            feesNumeric: {
              $toInt: { $replaceAll: { input: "$startingFee", find: ",", replacement: "" } }
            }
          }
        },
        { $match: { feesNumeric: { $gte: parseInt(fees.split("-")[0]), $lte: parseInt(fees.split("-")[1]) } } }
      ] : [])
    ];

    const [countResult, totalCoursesResult] = await Promise.all([
      University.aggregate([...countQuery, { $count: "count" }]).then(r => r[0]?.count || 0),
      University.aggregate([
        ...countQuery,
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: 'universityId',
            as: 'courses'
          }
        },
        {
          $project: {
            totalCourses: { $size: "$courses" }
          }
        },
        {
          $group: {
            _id: null,
            totalCourseCount: { $sum: "$totalCourses" }
          }
        }
      ]).then(r => r[0]?.totalCourseCount || 0)
    ]);

    const totalPages = Math.ceil(countResult / limit);
    const currentPage = Math.floor(skip / limit) + 1;

    res.json({
      status: 1,
      response: {
        universities,
        count: countResult,
        totalUniversityCourses: totalCoursesResult,
        totalPages,
        currentPage,
        length: universities.length
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal server error" });
  }
};


const getAllCourses = async (req, res) => {
  try {
    const {
      search = '',
      skip = 0,
      destination = "",
      qualification = "",
      subjectId = '',
      university = '',
      studyLevel = "",
      fees = "",
      limit = 10
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

    // -------------------- BASE MATCH CONDITIONS --------------------
    const matchStage = {
      $or: [
        { title: searchRegex },
        { subjectId: { $in: subjectIds } },
        { branchId: { $in: branchIds } },
        { universityId: { $in: universityIds } },
        { "universityId.name": searchRegex },
      ]
    };

    // -------------------- COURSE FILTERS --------------------
    const basePipeline = [
      {
        $lookup: {
          from: 'universities',
          localField: 'universityId',
          foreignField: '_id',
          as: 'universityId'
        }
      },
      { $unwind: { path: '$universityId', preserveNullAndEmptyArrays: true } },
      { $match: matchStage },
    ];

    if (destination) basePipeline.push({ $match: { country: destination } });
    if (university) basePipeline.push({ $match: { "universityId._id": new mongoose.Types.ObjectId(university) } });
    if (qualification) basePipeline.push({ $match: { qualification } });
    if (subjectId) basePipeline.push({ $match: { 'subjectId._id': new mongoose.Types.ObjectId(subjectId) } });
    if (studyLevel) basePipeline.push({ $match: { qualification: studyLevel } });

    if (fees) {
      const [minFee, maxFee] = fees.split("-").map(f => parseInt(f));
      basePipeline.push(
        {
          $addFields: {
            feesNumeric: {
              $convert: {
                input: {
                  $trim: {
                    input: { $replaceAll: { input: "$fees", find: ",", replacement: "" } },
                    chars: " "
                  }
                },
                to: "int",
                onError: null,
                onNull: null
              }
            }
          }
        },
        { $match: { feesNumeric: { $gte: minFee, $lte: maxFee } } }
      );
    }

    // -------------------- COURSE LIST QUERY --------------------
    const coursesPipeline = [
      ...basePipeline,
      {
        $addFields: {
          numericRank: {
            $convert: {
              input: { $trim: { input: "$rank", chars: " " } },
              to: "int",
              onError: null,
              onNull: null
            }
          }
        }
      },
      { $sort: { numericRank: 1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
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
      { $unwind: { path: '$branchId', preserveNullAndEmptyArrays: true } }
    ];

    // -------------------- TOTAL COURSE COUNT QUERY --------------------
    const countPipeline = [
      ...basePipeline,
      { $count: "count" }
    ];

    // -------------------- UNIQUE UNIVERSITY COUNT QUERY --------------------
    const universityCountPipeline = [
      ...basePipeline,
      {
        $group: {
          _id: "$universityId._id", // group by university id
        }
      },
      { $count: "universityCount" }
    ];

    const [courses, countResult, universityCountResult] = await Promise.all([
      Course.aggregate(coursesPipeline),
      Course.aggregate(countPipeline),
      Course.aggregate(universityCountPipeline)
    ]);

    const count = countResult[0]?.count || 0;
    const universityCount = universityCountResult[0]?.universityCount || 0;

    res.json({
      status: 1,
      response: {
        courses,
        count,               // total courses after filters
        universityCount,      // total unique universities
        length: courses.length,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(skip / limit) + 1,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal server error" });
  }
};




const getAllSearchList = async (req, res) => {
  try {
    const {
      search = '',
      filterBy = '',
      skip = 0,
      destination = "",
      qualification = "",
      subjectId = '',
      university = '',
      studyLevel = "",
      fees = ""
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

    const courseLimit = 10; // ✅ keep course limit only

    // -------------------- COURSES AGGREGATE --------------------
    let Coursequery = [
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
    ];

    if (destination !== "") Coursequery.push({ $match: { country: destination } });
    if (university !== "") Coursequery.push({ $match: { "universityId._id": new mongoose.Types.ObjectId(university) } });
    if (qualification !== "") Coursequery.push({ $match: { qualification } });
    if (subjectId) Coursequery.push({ $match: { 'subjectId._id': new mongoose.Types.ObjectId(subjectId) } });
    if (studyLevel !== "") Coursequery.push({ $match: { qualification: studyLevel } });

    if (fees !== "") {
      const [minFee, maxFee] = fees.split("-").map(f => parseInt(f));
      Coursequery.push(
        {
          $addFields: {
            feesNumeric: {
              $toInt: { $replaceAll: { input: "$fees", find: ",", replacement: "" } }
            }
          }
        },
        { $match: { feesNumeric: { $gte: minFee, $lte: maxFee } } }
      );
    }

    Coursequery.push(
      { $addFields: { numericRank: { $toInt: "$rank" } } },
      { $sort: { numericRank: 1 } },
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
      { $unwind: { path: '$branchId', preserveNullAndEmptyArrays: true } }
    );

    const coursePromise = Course.aggregate(Coursequery);

    const courseCountPromise = Course.aggregate([
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
            { universityId: { $in: universityIds } },
          ]
        }
      },
      { $count: 'count' }
    ]).then(result => result[0]?.count || 0);

    // -------------------- UNIVERSITIES AGGREGATE --------------------
    const universityMatch = { $or: [{ name: searchRegex }] };
    const universityQuery = [{ $match: universityMatch }];

    if (destination !== "") universityQuery.push({ $match: { country: destination } });
    if (studyLevel !== "") universityQuery.push({ $match: { qualification: studyLevel } });
    if (university !== "") universityQuery.push({ $match: { _id: new mongoose.Types.ObjectId(university) } });

    if (fees !== "") {
      const [minFee, maxFee] = fees.split("-").map(f => parseInt(f));
      universityQuery.push(
        {
          $addFields: {
            feesNumeric: {
              $toInt: { $replaceAll: { input: "$startingFee", find: ",", replacement: "" } }
            }
          }
        },
        { $match: { feesNumeric: { $gte: minFee, $lte: maxFee } } }
      );
    }

    universityQuery.push(
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'universityId',
          as: 'courses'
        }
      },
      {
        $addFields: {
          courseCount: { $size: "$courses" }
        }
      },
      { $addFields: { numericRank: { $toInt: "$rank" } } },
      { $sort: { numericRank: 1 } }
    );

    const universityPromise = University.aggregate(universityQuery);
    const universityCountPromise = University.countDocuments(universityMatch);

    const universityCourseCountPromise = University.aggregate([
      { $match: universityMatch },
      ...(destination !== "" ? [{ $match: { country: destination } }] : []),
      ...(studyLevel !== "" ? [{ $match: { qualification: studyLevel } }] : []),
      ...(university !== "" ? [{ $match: { _id: new mongoose.Types.ObjectId(university) } }] : []),
      ...(fees !== "" ? [
        {
          $addFields: {
            feesNumeric: {
              $toInt: { $replaceAll: { input: "$startingFee", find: ",", replacement: "" } }
            }
          }
        },
        { $match: { feesNumeric: { $gte: parseInt(fees.split("-")[0]), $lte: parseInt(fees.split("-")[1]) } } }
      ] : []),
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'universityId',
          as: 'courses'
        }
      },
      {
        $project: {
          totalCourses: { $size: "$courses" }
        }
      },
      {
        $group: {
          _id: null,
          totalCourseCount: { $sum: "$totalCourses" }
        }
      }
    ]).then(r => r[0]?.totalCourseCount || 0);

    // -------------------- SUBJECTS AGGREGATE --------------------
    const subjectPromise = Subject.find({ name: searchRegex });
    const subjectCountPromise = Subject.countDocuments({ name: searchRegex });

    // -------------------- RUN ALL IN PARALLEL --------------------
    const [courses, courseCount, universities, universityCount, subjects, subjectCount, totalUniversityCourses] = await Promise.all([
      coursePromise,
      courseCountPromise,
      universityPromise,
      universityCountPromise,
      subjectPromise,
      subjectCountPromise,
      universityCourseCountPromise
    ]);

    // ✅ Unique university count from course list
    const uniqueUniversityIds = new Set(courses.map(c => c.universityId?._id?.toString()));
    const universityCountFromCourses = uniqueUniversityIds.size;

    const response = {
      courses,
      universities,
      subjects,
      destination,
      count: {
        courses: courseCount,
        universities: universityCountFromCourses,
        subjects: subjectCount,
        universityCourses: totalUniversityCourses,
        total: courseCount + universityCountFromCourses + subjectCount
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

const getUniversity = async(req,res)=>{
  try {
    const countryUni = await University.find()

    if(!countryUni){
      return res.json({status:0,message:"No university Found"})
    }

    res.json({status:1,response:countryUni})

  } catch (error) {
    console.log(error)
  }
}

const getCourse = async(req,res)=>{
  try {
    const countryUni = await Course.find()

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


const addToFavourite = async (req, res) => {
  try {
    const { favourite, courseId, universityId } = req.body;
    
    const userId = req.params.mainUserData?._id; // assuming you have user from auth middleware

    if (!courseId && !universityId) {
      return res.json({ status: 0, message: "Update Id Required" });
    }

    // ---------- Course Favourite ----------
    if (courseId) {
      if (favourite) {
        // Add to Favourite collection
        await Favourite.create({ courseId, userId });

        // Update Course: mark favourite + add user
        await Course.findByIdAndUpdate(
          { _id: courseId },
          {
            $set: { isFavourite: true },
            $addToSet: { users: userId } // prevents duplicates
          },
          { new: true }
        );

        return res.json({ status: 1, message: "Course marked as favourite" });
      } else {
        // Remove from Favourite collection
        await Favourite.findOneAndDelete({
          courseId: new mongoose.Types.ObjectId(courseId),
          userId: new mongoose.Types.ObjectId(userId)
        });


        // Update Course: unset favourite if no more users, and remove user
        await Course.findByIdAndUpdate(
          { _id: courseId },
          {
            $set: { isFavourite: false },
            $pull: { users: userId }
          },
          { new: true }
        );

        return res.json({ status: 1, message: "Course removed from favourites" });
      }
    }

    // ---------- University Favourite ----------
    if (universityId) {
      if (favourite) {
        await Favourite.create({ universityId, userId });
        await University.findByIdAndUpdate(
          { _id: universityId },
          {
            $set: { isFavourite: true },
            $addToSet: { users: userId }
          },
          { new: true }
        );
        return res.json({ status: 1, message: "University marked as favourite" });
      } else {
        await Favourite.findOneAndDelete({
          universityId: new mongoose.Types.ObjectId(universityId),
          userId: new mongoose.Types.ObjectId(userId)
        });
        await University.findByIdAndUpdate(
          { _id: universityId },
          {
            $set: { isFavourite: false },
            $pull: { users: userId }
          },
          { new: true }
        );
        return res.json({ status: 1, message: "University removed from favourites" });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};


const getFavouriteList = async (req, res) => {
  try {
    const  userId  = req.params.mainUserData?._id; // or from req.user._id if auth

    const favourites = await Favourite.find({ userId: new mongoose.Types.ObjectId(userId) })
     .populate({
        path: "courseId",
        populate: {
          path: "universityId", // nested populate inside course
          model: "university",
        },
      })   // populate course details
      .populate("universityId"); // populate university details

    res.status(200).json({
      status: 1,
      count: favourites.length,
      data: favourites,
    });
  } catch (err) {
    console.error("Error fetching favourites:", err);
    res.status(500).json({ status: 0, message: "Server error" });
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
  createPopularCourse,
  addToFavourite,
  getFavouriteList,
  getCourse,
  getUniversity,
  getAllCourses,
  getAllUniversities
};