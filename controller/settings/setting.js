const Setting = require("../../schema/setting.schema")


const newSettings =async(req,res)=>{
    try {
        const {name,content} = req.body

         // Convert name to settingId format
    const settingId = name.toLowerCase().trim().replace(/\s+/g, '-');

    // Check if same settingId already exists
    const existing = await Setting.findOne({ settingId });
    if (existing) {
      return res.json({ status: 0, message: 'Setting ID already exists' });
    }

        const createSettings = await Setting.create({
            setting_name:name,
            content,
            settingId
        })

        if(!createSettings){
            return res.json({status:0,message:"Settings Not Created"})
        }

        res.json({status:1,message:'settings created'})
    } catch (error) {
        console.log(error)
    }
}

const updateGeminiContent = async(req,res)=>{
        try {
             const {content,settingId} = req.body

             if(!settingId){
                return res.json({status:0,message:"Setting name needed"})
             }

             const update = await Setting.findOneAndUpdate({settingId},{content})

             if(!update){
                return res.json({status:1,message:'Setting not updated'})
             }

             res.json({status:1,message:"Gemini Content updated"})
        } catch (error) {
            console.log(error)
        }
}

const getGeminiContent =async(req,res)=>{
    try {
        const {settingId}=req.body

        if(!settingId){
            return res.json({status:1,message:"setting ID needed"})
        }

        const geminiContent = await Setting.findOne({settingId})

        if(!geminiContent){
            return res.json({status:0,message:"Not result Found"})
        }

        res.json({status:1,message:"Success",content:geminiContent})
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    newSettings,
    updateGeminiContent,
    getGeminiContent
}