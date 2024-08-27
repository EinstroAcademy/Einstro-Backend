const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../../schema/admin.schema");

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
            const user = await Admin.findOne({email:email}) //$fagdgjgjh#@$%^jhasdjasdjasd
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


module.exports={signUp,login,forgotPassword,verifyOtp,resetPassword}