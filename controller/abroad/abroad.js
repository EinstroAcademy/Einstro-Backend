const _ = require('lodash');

const { endOfDay, startOfDay } = require('date-fns');
const fs = require('fs');
const path = require("path");
const Abroad = require('../../schema/abroad.schema');

function generateSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999
  }

function transformSentence(sentence) {
    const cleanSentence = sentence.replace(/[^\w\s]/g, '');
    const hyphenatedSentence = cleanSentence.split(' ').join('-');
    return hyphenatedSentence;
}

const createAbroad = async (req, res) => {
    try {
        const getAttachment = (path, name) =>
            encodeURI(path.substring(2) + name);

        const { data } = req.body;   // frontend sends: formData.append("data", JSON.stringify(payload))
        const parsed = JSON.parse(data);

        // Extract images (if uploaded)
        let head_img = "";
        let sec_img = "";

        if (req.files?.head_img?.[0]) {
            head_img = getAttachment(
                req.files.head_img[0].destination,
                req.files.head_img[0].filename
            );
        }

        if (req.files?.sec_img?.[0]) {
            sec_img = getAttachment(
                req.files.sec_img[0].destination,
                req.files.sec_img[0].filename
            );
        }

        if (req.files?.country_img?.[0]) {
            country_img = getAttachment(
                req.files.country_img[0].destination,
                req.files.country_img[0].filename
            );
        }

        

        // Inject image paths into parsed object
        parsed.header.head_img = head_img ;
        parsed.second_header.sec_img = sec_img ;
        parsed.country_img = country_img ;


        // Create route id from country name
        const routeId = parsed.country_name

        // Save to DB
        let created = await Abroad.create({
            ...parsed,
            route_id: routeId,
            createdBy: req.mainAdminId || null
        });

        if (!created) {
            return res.json({
                status: 0,
                message: "Abroad Not Created"
            });
        }

        return res.json({
            status: 1,
            message: "Abroad Created Successfully",
            data: created
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 0,
            message: "Server Error",
            error: error.message
        });
    }
};


const getAllAbroadList = async (req, res) => {
    try {
      const { search = '', active = '', fromDate = '', toDate = '', limit = 10, skip = 0 } = req.body;
      let query = [];
  
      if (search !== '') {
        query.push({
          $match: {
            $or: [
              { country_name: { $regex: search + '.*', $options: 'si' } },
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
  
      const abroadData = await Abroad.aggregate(finalquery);
      let data = abroadData[0].documentdata || [];
      let fullCount = abroadData[0].overall[0] ? abroadData[0].overall[0].counts : 0;
  
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

const getAbroadDetails =async(req,res)=>{
    try {
        const {abroad_id}=req.body
        if(!abroad_id){
            return res.json({status:0,message:"Abroad ID required"})
        }

        const abroad = await Abroad.findOne({_id:abroad_id})
        if(!abroad){
            return res.json({status:0,message:"abroad not found"})
        }
        res.json({status:1,response:abroad})
    } catch (error) {
        console.log(error)
    }
}

const getAbroadClientDetails =async(req,res)=>{
    try {
        const {abroad_id}=req.body
        if(!abroad_id){
            return res.json({status:0,message:"Abroad ID required"})
        }

        const abroad = await Abroad.findOne({route_id:abroad_id})
        if(!abroad){
            return res.json({status:0,message:"abroad not found"})
        }
        res.json({status:1,response:abroad})
    } catch (error) {
        console.log(error)
    }
}

const updateAbroad = async (req, res) => {
    try {
        const getAttachment = (file) =>
            encodeURI(file.destination.substring(2) + file.filename);

        const { data } = req.body;
        const parsed = JSON.parse(data);

        const abroadId = req.params.abroad_id;

        let existing = await Abroad.findById(abroadId);
        if (!existing) {
            return res.json({
                status: 0,
                message: "Record not found"
            });
        }

        // Handle image fields
        let head_img = existing.header?.head_img || "";
        let sec_img = existing.second_header?.sec_img || "";
        let country_img = existing.country_img || "";

        // Replace only if a new file is uploaded
        if (req.files?.head_img?.[0]) {
            // delete old one
            if (head_img) {
                const oldPath = path.join(__dirname, "..", head_img);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            head_img = getAttachment(req.files.head_img[0]);
        }

        if (req.files?.sec_img?.[0]) {
            if (sec_img) {
                const oldPath = path.join(__dirname, "..", sec_img);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            sec_img = getAttachment(req.files.sec_img[0]);
        }

        if (req.files?.country_img?.[0]) {
            if (country_img) {
                const oldPath = path.join(__dirname, "..", country_img);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            country_img = getAttachment(req.files.country_img[0]);
        }

        // Inject final image URLs
        parsed.header.head_img = head_img;
        parsed.second_header.sec_img = sec_img;
        parsed.country_img = country_img;

        // Update route id if country name changed
        const routeId = parsed.country_name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-");

        parsed.route_id = routeId;

        let updated = await Abroad.findByIdAndUpdate(
            abroadId,
            { ...parsed },
            { new: true }
        );

        return res.json({
            status: 1,
            message: "Abroad updated successfully",
            data: updated
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 0,
            message: "Server Error",
            error: error.message
        });
    }
};



module.exports = {
    createAbroad,
    getAllAbroadList,
    getAbroadDetails,
    getAbroadClientDetails,
    updateAbroad
}