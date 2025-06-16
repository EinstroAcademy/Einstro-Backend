const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../schema/user.schema");
const fs = require('fs');
const Serial = require("../../schema/serial.schema");


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

const getAllUserList = async (req, res) => {
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
                firstName: 1,
                lastName: 1,
                fullName: 1,
                email: 1,
                password: 1,
                photo: 1,
                role: 1,
                mobile: 1,
                image: 1,
                city: 1,
                nationality: 1,
                dob: 1,
                country: 1,
                qualification: 1,
                school12th: 1,
                englishTest: 1,
                preferred: 1,
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
  
      const userData = await User.aggregate(finalquery);
      let data = userData[0].documentdata || [];
      let fullCount = userData[0].overall[0] ? userData[0].overall[0].counts : 0;
  
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

const createStudent = async (req, res) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            dob,
            firstLanguage,
            country,
            maritalStatus,
            gender,
            email,
            passport,
            passport_expiry_date,
            address,
            city,
            state,
            postalCode
        } = req.body;

        // ✅ 1. Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ status: 0, message: "Email already exists" });
        }

        // ✅ 2. Check if passport number already exists
        const existingPassport = await User.findOne({ passport });
        if (existingPassport) {
            return res.status(400).json({ status: 0, message: "Passport number already exists" });
        }

        // ✅ 3. Validate date of birth (minimum 17 years old)
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const isOldEnough = age > 17 || (age === 17 && (
            today.getMonth() > birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
        ));

        if (!isOldEnough) {
            return res.status(400).json({ status: 0, message: "Student must be at least 17 years old" });
        }

        // ✅ 4. Validate passport expiry date (must be future)
        const passportExpiry = new Date(passport_expiry_date);
        if (passportExpiry <= today) {
            return res.status(400).json({ status: 0, message: "Passport expiry date must be in the future" });
        }

        // Generate student ID
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const datePrefix = `ST${yyyy}${mm}${dd}`;

        let serialData = await Serial.findOne();
        let studentId = '';
        let newSerial = 1001;

        if (!serialData) {
            studentId = `${datePrefix}${newSerial}`;
            serialData = await Serial.create({ serial: newSerial });
        } else {
            newSerial = serialData.serial + 1;
            studentId = `${datePrefix}${newSerial}`;
            await Serial.findByIdAndUpdate(
                serialData._id,
                { serial: newSerial },
                { new: true }
            );
        }

        // Create user
        const createNew = await User.create({
            firstName,
            middleName,
            lastName,
            dob,
            firstLanguage,
            country,
            maritalStatus,
            gender,
            email,
            passport,
            passport_expiry_date,
            address,
            city,
            state,
            postalCode,
            studentId
        });

        if (!createNew) {
            return res.json({ status: 0, message: "Student Not Created" });
        }

        res.json({ status: 1, message: "Student Created", studentId });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 0, message: "Internal server error" });
    }
};




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
  updateSchool12th,
  getAllUserList,
  createStudent
};