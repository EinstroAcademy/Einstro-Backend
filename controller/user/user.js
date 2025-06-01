const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../schema/user.schema");
const fs = require('fs')


const signUp = async(req,res)=>{
    try {
        const {firstName,lastName,fullName,email,password,mobile}= req.body
        if(email!==""){
            const user =await User.find({email:email}) // group --[]
            if(user.length>0){
                return res.json({status:0,message:"Email ALready Exist"})
            }

          let hashPassword = await bcrypt.hash(password,10)


            const createUser = await User.create({
                email:email,
                password:hashPassword,
                fullName,
                firstName,
                lastName,
                role:'user',
                mobile
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
            const user = await User.findOne({email:email}) //$fagdgjgjh#@$%^jhasdjasdjasd
            if(!user){
                return res.json({status:0,message:'User not Found'})
            }
            let checkPassword = await bcrypt.compare(password,user.password) // true/false
            if(checkPassword){

                let token = jwt.sign({email:user.email,id:user._id,username:user.username,role:user.role},"einstrostudyabroad",{expiresIn:'2d'})
                return  res.json({status:1,message:'Login Successfully',token:token,user})
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
            const user = await User.findOne({email:email})
            if(user){
                let otp = Math.floor(1000 + Math.random() * 9000); //4 digit
                let otpTimeStamp = Date.now() +300000 //5mins
                let updateUser = await User.findByIdAndUpdate({_id:user._id},{otp:otp,otpTimeStamp:otpTimeStamp})
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
            const user = await User.findOne({email:email})
            if(user){
                if(user.otpTimeStamp>Date.now()){ //7:47 > 7:49
                        if(parseInt(otp)===user.otp){ //1234 === 1235
                            const update = await User.findByIdAndUpdate({_id:user._id},{otpVerified:true})
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
            const user = await User.findOne({email:email})
            if(user){
                if(user.otpVerified){
                    if(newPassword===confirmPassword){
                        let hashPassword = await bcrypt.hash(newPassword,10)
                        const update = await User.findByIdAndUpdate({_id:user._id},{password:hashPassword,otpVerified:false})
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

const getUser = async(req,res)=>{
    try {
        const {token} = req.body
        if (token) {
            jwt.verify(token,process.env.JWT_SECRET, async (err, decoded) => {
              if (err || !decoded.email) {
                const data = {};
                data.response = 'Unauthorized Access';
                data.message = 'Session Expired';
                data.status = '00';
                res.send(data);
              } else {
                
                      let mainUser = await User.findOne({email:decoded.email})

                  res.json({status:1,user:mainUser})
              }
            });
          }
    } catch (error) {
        console.log(error)
    }
}

const updateUser = async(req,res)=>{
    try {
        const {fullName,country,city,nationality,mobile,dob,userId} = req.body

        if(!userId){
            return res.json({status:0,message:"No user ID"})
        }

        const updateUser = await User.findByIdAndUpdate({_id:userId},{
            $set:{
                fullName,
                country,
                city,
                nationality,
                mobile,
                dob
            }
        })

        if(!updateUser){
            return res.json({state:0,message:'Not updated'})
        }

        res.json({status:1,message:"User Updated"})

    } catch (error) {
        console.log(error)
    }
}

const updateUserQualification = async(req,res)=>{
    try {
        const {degree,country,university,cgpa_level,score,userId} = req.body

        if(!userId){
            return res.json({status:0,message:"No user ID"})
        }

        const updateUser = await User.findByIdAndUpdate({_id:userId},{
            $set:{
                qualification:{
                    degree,
                    country,
                    university,
                    cgpa_level,
                    score
                }
            }
        })

        if(!updateUser){
            return res.json({state:0,message:'Not updated'})
        }

        res.json({status:1,message:"User Updated"})

    } catch (error) {
        console.log(error)
    }
}

const updateProfilePic =async (req,res)=>{
    try {
        const getAttachment = (path, name) => encodeURI(path.substring(2) + name);
        let userId = req.body.userId
        userId = req.params.mainUserId
        const image = getAttachment(req.files.image[0].destination, req.files.image[0].filename);

        console.log(image)
        if(!userId){
            return res.json({status:0,message:"No user ID"})
        }

        const updateUser = await User.findByIdAndUpdate({_id:userId},{
            $set:{
                image:image
            }
        })

        if(!updateUser){
            return res.json({state:0,message:'Not updated'})
        }

        res.json({status:1,message:"User Updated"})

        
    } catch (error) {
        console.log(error)
    }
}


const updateEnglishTest = async(req,res)=>{
    try {
        const {test,overallScore,listening,speaking,reading,writing,userId} = req.body

        if(!userId){
            return res.json({status:0,message:"No user ID"})
        }

        const updateUser = await User.findByIdAndUpdate({_id:userId},{
            $set:{
                englishTest:{
                    test,
                    overallScore,
                    listening,
                    speaking,
                    reading,
                    writing
                }
            }
        })

        if(!updateUser){
            return res.json({state:0,message:'Not updated'})
        }

        res.json({status:1,message:"User Updated"})

    } catch (error) {
        console.log(error)
    }
}

const updateSchool12th = async(req,res)=>{
    try {
        const {school,
             boardOfEducation,
             mediumOfInstruction,
             yearsOfPassing,
             subjectStudied,
             totalMarks,
             marksObtained,
             percentage,userId} = req.body

        if(!userId){
            return res.json({status:0,message:"No user ID"})
        }

        const updateUser = await User.findByIdAndUpdate({_id:userId},{
            $set:{
                school12th:{
                    school,
             boardOfEducation,
             mediumOfInstruction,
             yearsOfPassing,
             subjectStudied,
             totalMarks,
             marksObtained,
             percentage
                }
            }
        })

        if(!updateUser){
            return res.json({state:0,message:'Not updated'})
        }

        res.json({status:1,message:"User Updated"})

    } catch (error) {
        console.log(error)
    }
}

const updatePreferred = async(req,res)=>{
    try {
        const {destination,degree,start_year,userId} = req.body

        if(!userId){
            return res.json({status:0,message:"No user ID"})
        }

        const updateUser = await User.findByIdAndUpdate({_id:userId},{
            $set:{
                preferred:{
                    destination,
                    degree,
                    start_year
                }
            }
        })

        if(!updateUser){
            return res.json({state:0,message:'Not updated'})
        }

        res.json({status:1,message:"User Updated"})

    } catch (error) {
        console.log(error)
    }
}


module.exports = {
  signUp,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getUser,
  updateUser,
  updateUserQualification,
  updateProfilePic,
  updateEnglishTest,
  updatePreferred,
  updateSchool12th
};