const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../../schema/admin.schema");
const fs = require('fs');
const { promisify } = require('util');
const User = require("../../schema/user.schema");
const subAdmin = require("../../schema/subadmin.schema");
const unlinkAsync = promisify(fs.unlink);

const signUp = async(req,res)=>{
    try {
        const {employeeName,designation,permissions,email,password,mobile}= req.body
        if(email!==""){
            const subadmin =await subAdmin.find({email:email}) // group --[]
            if(subadmin.length>0){
                return res.json({status:0,message:"Email ALready Exist"})
            }

          let hashPassword = await bcrypt.hash(password,10)


            const createSubadmin = await subAdmin.create({
                email:email,
                password:hashPassword,
                employeeName:employeeName,
                permissions,
                designation,
                role:'sub_admin'
            })
            if(!createSubadmin){
                return res.json({status:0,message:"User Not Created"})
            }
            res.json({status:1,message:"Subadmin Created"})
        }else{
            return res.json({status:0,message:"Email is required"})
        }
    } catch (error) {
        console.log(error)
    }
}




const forgotPassword = async(req,res)=>{
    try {
        const {email}=req.body
        if(email!==""){
            const user = await Admin.findOne({email:email})
            if(user){
                let otp = Math.floor(1000 + Math.random() * 9000); //4 digit
                let otpTimeStamp = Date.now() +300000 //5mins
                let updateUser = await Admin.findByIdAndUpdate({_id:user._id},{otp:otp,otpTimeStamp:otpTimeStamp})
                if(!updateUser){
                    return res.json({status:0,message:"OTP Not sent"})
                }
                let content = `Your OTP -${otp}. This otp valid for upto 5mins. `
                // sendmail("neelakandanguhan@gmail.com","Otp for Forgot Password",content)
                res.json({status:1,message:`Otp Sent to Your Mail -${otp}`})
                console.log(otp)
            }else{
                return res.json({status:0,message:"Email ID doesn't exist"})
            }
        }
    } catch (error) {
        console.log(error)
    }
}

const verifyOtp = async(req,res)=>{
    try {
        const {email,otp}=req.body
        if(email!==""){
            const user = await Admin.findOne({email:email})
            if(user){
                if(user.otpTimeStamp>Date.now()){ //7:47 > 7:49
                        if(parseInt(otp)===user.otp){ //1234 === 1235
                            const update = await Admin.findByIdAndUpdate({_id:user._id},{otpVerified:true})
                            if(!update){
                                return res.json({status:0,message:"Otp Verification Failed"})
                            }
                            return res.json({status:1,message:"Otp verified Successfully"})
                        }else{
                            return res.json({status:0,message:"Invalid Otp"})
                        }
                }else{
                    return res.json({status:2,message:"Otp Expired"})
                }
            }else{
                return res.json({status:0,message:"User Not found"})
            }
        }
    } catch (error) {
        console.log(error)
    }
}

const resetPassword = async(req,res)=>{
    try {
        const {email,newPassword,confirmPassword}= req.body
        if(email!==""){
            const user = await Admin.findOne({email:email})
            if(user){
                if(user.otpVerified){
                    if(newPassword===confirmPassword){
                        let hashPassword = await bcrypt.hash(newPassword,10)
                        const update = await Admin.findByIdAndUpdate({_id:user._id},{password:hashPassword,otpVerified:false})
                        if(!update){
                            return res.json({status:0,message:"Password Not Updated"})
                        }
                        res.json({status:1,message:"Password Reset Successfully"})
                    }else{
                        return res.json({status:0,message:"Password and Confirm Password Does not match"})
                    }
                }else{
                    return res.json({status:2,message:"Otp Verification Required"})
                }
            }else{
                return res.json({status:0,message:"User Not Found"})
            }
        }
    } catch (error) {
        console.log(error)
    }
}

const adminUpdatePassword =async(req,res)=>{
    try {
        const {adminId,newPassword,confirmPassword,oldPassword}= req.body
        if(!adminId){
            return res.json({status:0,message:"AdminId is required"})
        }
        const user = await Admin.findById(adminId)
        if(!user){
            return res.json({status:0,message:"User Not Found"})
        }
        const isValidPassword = await bcrypt.compare(oldPassword,user.password)
        if(!isValidPassword){
            return res.json({status:0,message:"Old Password is Incorrect"})
        }

        if(newPassword===confirmPassword && isValidPassword){
            let hashPassword = await bcrypt.hash(newPassword,10)
            const update = await Admin.findByIdAndUpdate({_id:user._id},{password:hashPassword})
            if(!update){
                return res.json({status:0,message:"Password not updated"})
            }
        }else{
            return res.json({status:0,message:"Password and Confirm Password Does not match"})
        }

        res.json({status:1,message:'Password Updated Successfully'})

    } catch (error) {
        console.log(error)
    }
}

const updateAdminProfileImage =async(req,res)=>{
    try {
        const {adminId,oldImage}=req.body
        const getAttachment = (path, name) => encodeURI(path.substring(2) + name);
        const image = getAttachment(req.files.image[0].destination, req.files.image[0].filename);

        const update = await Admin.findByIdAndUpdate({_id:adminId},{image:image})
        if(!update){
            return res.json({status:0,message:"Image not updated"})
        }

        if(oldImage!==""){
            unlinkAsync(oldImage)
            .then((resolved) => {
             console.log('Photo removed')
            })
            .catch((error) => {
              console.log('error', error);
            });
        }
        res.json({status:1,message:"Profile Pic Updated"})
    } catch (error) {
        console.log(error)
    }
}

const removeProfilePic =async(req,res)=>{
    try {
        const {adminId,oldImage}=req.body
        const updateAdmin =await Admin.findByIdAndUpdate({_id:adminId},{image:''})
        if(!updateAdmin){
            return res.json({status:0,message:"Photo not removed"})
        }

        if(oldImage!==""){
            unlinkAsync(oldImage)
            .then((resolved) => {
             console.log('Photo removed')
            })
            .catch((error) => {
              console.log('error', error);
            });
        }

        res.json({status:1,message:"Photo Removed"})
    } catch (error) {
        console.log(error)
    }
}


const getAdminDetails = async(req,res)=>{
    try {
        const {adminId}= req.body
        if(!adminId){
            return res.json({status:1,message:"Admin Id required"})
        }

        const admin = await Admin.findById({_id:adminId})
        if(!admin){
            return res.json({status:0,message:"Admin Not Found"})
        }

        res.json({status:1,response:admin})
    } catch (error) {
        console.log(error)
    }
}

const updateAdminDetails = async(req,res)=>{
    try {
        const {adminId,username,email,mobile}= req.body
        if(!adminId){
            return res.json({status:1,message:"Admin Id required"})
        }
        let obj={
            username,email,mobile
        }

        const admin = await Admin.findByIdAndUpdate({_id:adminId},obj)
        if(!admin){
            return res.json({status:0,message:"Admin Not Found"})
        }

        res.json({status:1,message:"Admin Details Updated"})
    } catch (error) {
        console.log(error)
    }
}

const approveImage = async(req,res)=>{
    try {
        const {userId,filename,status}= req.body

        if(!userId){
            return  res.json({status:1,message:"User Id required"})
        }

        let obj = {
            [`verificationStatus.${filename}`]: status,
        };

        const updateStatus = await User.findByIdAndUpdate({_id:userId},obj)

        if(!updateStatus){
            return res.json({status:0,message:"Status noy pdated"})
        }

        res.json({status:1,message:"Approved"})

    } catch (error) {
        console.log(error)
    }
}

const subadminList = async (req, res) => {
  try {
    const {
      search = "",
      limit = 10,
      skip = 0
    } = req.body;

    let query = [];

    // SEARCH FILTER
    if (search !== "") {
      query.push({
        $match: {
          $or: [
            { name: { $regex: search + ".*", $options: "si" } },
            { email: { $regex: search + ".*", $options: "si" } },
            { designation: { $regex: search + ".*", $options: "si" } }
          ]
        }
      });
    }

    // SORT BY LATEST
    query.push({ $sort: { createdAt: -1 } });

    // DOCUMENT LIST PIPELINE
    const documentQuery = [
      ...query,
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      {
        $project: {
          password: 0,     // hide password
          __v: 0
        }
      }
    ];

    // COUNT PIPELINE
    const overallQuery = [
      ...query,
      { $count: "counts" }
    ];

    // FACET
    const finalquery = [
      {
        $facet: {
          overall: overallQuery,
          documentdata: documentQuery
        }
      }
    ];

    // DB CALL
    const subadminData = await subAdmin.aggregate(finalquery);

    let data = subadminData[0].documentdata || [];
    let fullCount = subadminData[0].overall[0] ? subadminData[0].overall[0].counts : 0;

    // RESPONSE FORMAT (same as your blog function)
    if (data.length > 0) {
      res.json({
        status: 1,
        response: {
          result: data,
          fullcount: fullCount,
          length: data.length
        }
      });
    } else {
      res.json({
        status: 0,
        response: {
          result: [],
          fullcount: fullCount,
          length: 0
        }
      });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 0, message: "Internal server error" });
  }
};

const deleteSubadmin = async (req, res) => {
  try {
    const { subadminId } = req.body;

    if (!subadminId) {
      return res.json({
        status: 0,
        message: "subadminId is required"
      });
    }

    const deleted = await subAdmin.findByIdAndDelete({_id:subadminId});

    if (!deleted) {
      return res.json({
        status: 0,
        message: "Subadmin not found"
      });
    }

    res.json({
      status: 1,
      message: "Subadmin deleted successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 0,
      message: "Internal server error"
    });
  }
};

const updateSubadmin = async (req, res) => {
  try {
    const { 
      subadminId,
      employeeName,
      designation,
      permissions,
      email,
      password,
      mobile
    } = req.body;

    if (!subadminId) {
      return res.json({
        status: 0,
        message: "subadminId is required"
      });
    }

    // Check existing subadmin
    const existing = await subAdmin.findById(subadminId);
    if (!existing) {
      return res.json({
        status: 0,
        message: "Subadmin not found"
      });
    }

    // Check if email changed
    if (email && email !== existing.email) {
      const emailExists = await SubAdmin.findOne({
        email: email,
        _id: { $ne: subadminId }
      });

      if (emailExists) {
        return res.json({
          status: 0,
          message: "Email already exists for another subadmin"
        });
      }
    }

    let updatedData = {
      employeeName,
      designation,
      permissions,
      email,
      mobile,
      updatedAt: new Date()
    };

    // Hash password if provided
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updatedData.password = hashed;
    }

    await subAdmin.findByIdAndUpdate(subadminId, updatedData, { new: true });

    res.json({
      status: 1,
      message: "Subadmin updated successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 0,
      message: "Internal server error"
    });
  }
};




module.exports = {
  signUp,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getAdminDetails,
  updateAdminDetails,
  adminUpdatePassword,
  updateAdminProfileImage,
  removeProfilePic,
  subadminList,
  deleteSubadmin,
  updateSubadmin
};