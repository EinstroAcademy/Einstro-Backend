const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../../schema/admin.schema");
const fs = require('fs');
const { promisify } = require('util');
const User = require("../../schema/user.schema");
const { Course } = require("../../schema/course.schema");
const { University } = require("../../schema/subject.schema");
const subAdmin = require("../../schema/subadmin.schema");
const { sendEmail } = require("../../middleware/sendmail");
const unlinkAsync = promisify(fs.unlink);

const signUp = async(req,res)=>{
    try {
        const {username,email,password,mobile}= req.body
        if(email!==""){
            const user =await Admin.find({email:email}) // group --[]
            if(user.length>0){
                return res.json({status:0,message:"Email ALready Exist"})
            }

          let hashPassword = await bcrypt.hash(password,10)


            const createUser = await Admin.create({
                email:email,
                password:hashPassword,
                username:username,
                role:'admin'
            })
            if(!createUser){
                return res.json({status:0,message:"User Not Created"})
            }
            res.json({status:1,message:"User Created"})
        }else{
            return res.json({status:0,message:"Email is required"})
        }
    } catch (error) {
        console.log(error)
    }
}

const login = async(req,res)=>{
    try {
        const {email,password}=req.body
            let user = await Admin.findOne({email:email}) //$fagdgjgjh#@$%^jhasdjasdjasd
            if(!user){
                user = await subAdmin.findOne({email:email})
            }

            if(!user){
                return res.json({status:0,message:'User not Found'})
            }
            let checkPassword = await bcrypt.compare(password,user.password) // true/false
            if(checkPassword){
                let token = jwt.sign({email:user.email,id:user._id,username:user.username,role:user.role},"einstrostudyabroad",{expiresIn:'8hr'})
                return  res.json({status:1,message:'Login Successfully',token:token})
            }else{
                return res.json({status:0,message:"Invalid Credentials"})
            }
    } catch (error) {
        console.log(error)
    }
}


const forgotPassword = async(req,res)=>{
    try {
        const {email}=req.body
        if(email!==""){
            let user = await Admin.findOne({email:email})
            if(!user){
                user = await subAdmin.findOne({email:email})
            }
            if(user){
                let otp = Math.floor(1000 + Math.random() * 9000); //4 digit
                let otpTimeStamp = Date.now() +300000 //5mins
                if(user.role==='admin'){
                     let updateUser = await Admin.findByIdAndUpdate({_id:user._id},{otp:otp,otpTimeStamp:otpTimeStamp})
                if(!updateUser){
                    return res.json({status:0,message:"OTP Not sent"})
                }
                }
                if(user?.role ==='sub_admin'){
                     let updateUser = await subAdmin.findByIdAndUpdate({_id:user._id},{otp:otp,otpTimeStamp:otpTimeStamp})
                if(!updateUser){
                    return res.json({status:0,message:"OTP Not sent"})
                }
                }
               
                let content = `Your OTP -${otp}. This otp valid for upto 5mins. `
                // sendEmail("neelakandanguhan@gmail.com","Otp for Forgot Password",content)
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

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (email !== "") {
      // Check in Admin first
      let user = await Admin.findOne({ email });
      let userType = "admin";

      // If not found, check in subAdmin
      if (!user) {
        user = await subAdmin.findOne({ email });
        userType = "sub_admin";
      }

      if (user) {
        if (user.otpTimeStamp > Date.now()) {
          if (parseInt(otp) === user.otp) {
            const update =
              userType === "admin"
                ? await Admin.findByIdAndUpdate(
                    { _id: user._id },
                    { otpVerified: true }
                  )
                : await subAdmin.findByIdAndUpdate(
                    { _id: user._id },
                    { otpVerified: true }
                  );

            if (!update) {
              return res.json({ status: 0, message: "OTP Verification Failed" });
            }
            return res.json({ status: 1, message: "OTP Verified Successfully" });
          } else {
            return res.json({ status: 0, message: "Invalid OTP" });
          }
        } else {
          return res.json({ status: 2, message: "OTP Expired" });
        }
      } else {
        return res.json({ status: 0, message: "User Not Found" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 0, message: "Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (email !== "") {
      // Check in Admin first
      let user = await Admin.findOne({ email });
      let userType = "admin";

      // If not found, check in subAdmin
      if (!user) {
        user = await subAdmin.findOne({ email });
        userType = "sub_admin";
      }

      if (user) {
        if (user.otpVerified) {
          if (newPassword === confirmPassword) {
            const hashPassword = await bcrypt.hash(newPassword, 10);

            const update =
              userType === "admin"
                ? await Admin.findByIdAndUpdate(
                    { _id: user._id },
                    { password: hashPassword, otpVerified: false }
                  )
                : await subAdmin.findByIdAndUpdate(
                    { _id: user._id },
                    { password: hashPassword, otpVerified: false }
                  );

            if (!update) {
              return res.json({ status: 0, message: "Password Not Updated" });
            }

            return res.json({
              status: 1,
              message: "Password Reset Successfully",
            });
          } else {
            return res.json({
              status: 0,
              message: "Password and Confirm Password Do Not Match",
            });
          }
        } else {
          return res.json({
            status: 2,
            message: "OTP Verification Required",
          });
        }
      } else {
        return res.json({ status: 0, message: "User Not Found" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 0, message: "Server Error" });
  }
};

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


const adminDashboard = async (req, res) => {
  try {
    const [courseCount, universityCount, userCount] = await Promise.all([
      Course.countDocuments(),
      University.countDocuments(),
      User.countDocuments()
    ]);

      res.json({
          status: 1,
          result: {
              course: courseCount,
              university: universityCount,
              user: userCount
          }
      });
  } catch (error) {
    console.error("admin Dashboard --->", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const getSubadmins = async(req,res)=>{
     try {
        const { search = '', active = '', fromDate = '', toDate = '', limit = 10, skip = 0 } = req.body;
        let query = [];

        if (search !== '') {
            query.push({
                $match: {
                    $or: [
                        { username: { $regex: search + '.*', $options: 'si' } },
                        { location: { $regex: search + '.*', $options: 'si' } },
                        { email: { $regex: search + '.*', $options: 'si' } },
                        { mobile: { $regex: search + '.*', $options: 'si' } },
                        { firstName: { $regex: search + '.*', $options: 'si' } },
                        { lastName: { $regex: search + '.*', $options: 'si' } },

                    ]
                }
            });
        }

        if (active !== '') {
            query.push({ $match: { isActive: active } });
        }

        if (fromDate !== '') {
            query.push({ $match: { createdAt: { $gte: new Date(fromDate) } } });
        }

        if (toDate !== '') {
            query.push({ $match: { createdAt: { $lte: new Date(toDate) } } });
        }

        query.push({ $sort: { createdAt: -1 } });

        const documentQuery = [
            ...query,
            { $skip: parseInt(skip) },
            { $limit: parseInt(limit) },
            {
                $project: {
                    username: 1,
                    email: 1,
                    password: 1,
                    photo: 1,
                    role: 1,
                    mobile: 1,
                    image: 1
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

        const subadminData = await subAdmin.aggregate(finalquery);
        let data = subadminData[0].documentdata || [];
        let fullCount = subadminData[0].overall[0] ? subadminData[0].overall[0].counts : 0;

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
    }  catch (error) {
        console.log("subadmin list",error)
    }
}



module.exports = {
  signUp,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getAdminDetails,
  updateAdminDetails,
  adminUpdatePassword,
  updateAdminProfileImage,
  removeProfilePic,
  approveImage,
  adminDashboard
};