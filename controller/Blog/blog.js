const _ = require('lodash');

const Blog = require('../../schema/blog.schema');
const { endOfDay, startOfDay } = require('date-fns');
const fs = require('fs')

function generateSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999
  }

function transformSentence(sentence) {
    const cleanSentence = sentence.replace(/[^\w\s]/g, '');
    const hyphenatedSentence = cleanSentence.split(' ').join('-');
    return hyphenatedSentence;
}



const createBlog =async (req,res)=>{
    try {
        const getAttachment = (path, name) => encodeURI(path.substring(2) + name);
        const { title,postedOn,description,details,type} = req.body;
        const image = getAttachment(req.files.image[0].destination, req.files.image[0].filename);
        const doc = getAttachment(req.files.doc[0].destination,req.files.doc[0].filename)
        let routeId = transformSentence(title)

        console.log(image)

        let create = await Blog.create({
          title,
          image,
          postedOn,
          description,
          details,
          postedOn:new Date(),
          blogId:`${type==='blog'? "BLOG" : "GUIDE"}-${generateSixDigitNumber()}`,
          routeId,
          doc,
          type,
          createdBy:req.params.mainAdminId,
          createdByModel:req?.params?.mainAdminData?.role
        });

        if(!create){
            return res.json({status:0,message:"Blog Not Created"})
        }

        res.json({status:1,message:"Blog created"})
    } catch (error) {
        console.log(error)
    }
}

const getAllBlogList = async (req, res) => {
    try {
      const { search = '', active = '', fromDate = '', toDate = '', limit = 10, skip = 0 } = req.body;
      let query = [];
  
      if (search !== '') {
        query.push({
          $match: {
            $or: [
              { title: { $regex: search + '.*', $options: 'si' } },
              { description: { $regex: search + '.*', $options: 'si' } },
              { details: { $regex: search + '.*', $options: 'si' } }
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
            title: 1,
            title:1,
            image: 1,
            description: 1,
            details: 1,
            postedOn: 1,
            blogId:1,
            createdAt: 1,
            updatedAt: 1,
            routeId:1,
            type:1,
            doc:1
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
  
      const blogData = await Blog.aggregate(finalquery);
      let data = blogData[0].documentdata || [];
      let fullCount = blogData[0].overall[0] ? blogData[0].overall[0].counts : 0;
  
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

const getAllClientBlogList = async (req, res) => {
    try {
      const { search = '', active = '', fromDate = '', toDate = '', limit = 4, skip = 0 } = req.body;
      let query = [];
  
      if (search !== '') {
        query.push({
          $match: {
            $or: [
              { title: { $regex: search + '.*', $options: 'si' } },
              { description: { $regex: search + '.*', $options: 'si' } },
              { details: { $regex: search + '.*', $options: 'si' } }
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
          $sort : {createdAt :-1}
        },
        {
          $project: {
            title: 1,
            title:1,
            image: 1,
            description: 1,
            details: 1,
            postedOn: 1,
            blogId:1,
            routeId:1,
            createdAt: 1,
            updatedAt: 1,
            type:1
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
  
      const blogData = await Blog.aggregate(finalquery);
      let data = blogData[0].documentdata || [];
      let fullCount = blogData[0].overall[0] ? blogData[0].overall[0].counts : 0;
  
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

const getBlogDetails =async(req,res)=>{
    try {
        const {blogId}=req.body
        console.log(req.body)
        if(!blogId){
            return res.json({status:0,message:"Blog ID required"})
        }

        const blog = await Blog.findOne({_id:blogId})
        if(!blog){
            return res.json({status:0,message:"Blog not found"})
        }
        res.json({status:1,response:blog})
    } catch (error) {
        console.log(error)
    }
}

const removeBlog = async (req, res) => {
    try {
        const { blogId, image } = req.body;

        if (!blogId) {
            return res.json({ status: 0, message: "Blog ID required" });
        }

        // Try to unlink the image, skip if not found
        if (image) {
            try {
                // Use path.resolve to be extra safe
                const imagePath = path.resolve(image);
                fs.unlinkSync(imagePath);
            } catch (err) {
                console.log("Image not found or could not be deleted:", err.message);
            }
        }

        const blog = await Blog.findByIdAndDelete({ _id: blogId });

        if (!blog) {
            return res.json({ status: 0, message: "Blog not Removed" });
        }

        res.json({ status: 1, message: "Blog is Removed" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 0, message: "Internal server error" });
    }
}

const editBlog = async(req,res)=>{
    try {
        const {_id,blogId,title,description,details,postedOn,isActive,type}=req.body
        const getAttachment = (path, name) => encodeURI(path.substring(2) + name);
        let image=""
        let doc=""
        if(req.files.image){
             image = getAttachment(req.files.image[0].destination, req.files.image[0].filename);
        }
         if(req.files.doc){
             doc = getAttachment(req.files.doc[0].destination, req.files.doc[0].filename);
        }
        if(!_id){
            return res.json({status:0,message:"Blog ID required"})
        }
        let updatedData = {
          title: title,
          description: description,
          details: details,
          postedOn: postedOn?postedOn:new Date(),
          isActive: isActive,
          blogId:blogId?blogId:`BLOG-${generateSixDigitNumber()}`,
          routeId:transformSentence(title),
          type
        };

        const unLinkImage = await Blog.findById(_id)

        if(!unLinkImage){
            return res.json({status:0,message:"Blog not found"})
        }

        if (image !== "") {
            updatedData.image = image;

            try {
                if (unLinkImage.image) {
                    const oldImagePath = path.resolve(unLinkImage.image);
                    fs.unlinkSync(oldImagePath);
                }
            } catch (err) {
                console.log("Could not delete old image:", err.message);
            }
        }
        if (doc !== "") {
            updatedData.doc = doc;

            try {
                if (unLinkImage.doc) {
                    const oldImagePath = path.resolve(unLinkImage.doc);
                    fs.unlinkSync(oldImagePath);
                }
            } catch (err) {
                console.log("Could not delete old doc:", err.message);
            }
        }
       const blog = await Blog.findByIdAndUpdate(_id,{$set:updatedData})
       if(!blog){
        return res.json({status:0,message:"Blog not Updated"})
       }
       res.json({status:1,message:"Updated"})
    } catch (error) {
        console.log(error)
    }
}
  


module.exports={createBlog,getAllBlogList,getBlogDetails,removeBlog,editBlog,getAllClientBlogList}