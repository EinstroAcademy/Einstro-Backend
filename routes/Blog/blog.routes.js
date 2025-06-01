const express = require('express');
const { createBlog, getAllBlogList, getBlogDetails, removeBlog, editBlog, getAllClientBlogList } = require('../../controller/Blog/blog');
const { authorizedAdmin } = require('../../middleware/authAdmin');
const {uploadFile} = require('../../middleware/uploadFile');
const router = express.Router()


router.post('/admin/create/blog',authorizedAdmin,
    uploadFile('./uploads/blogImages/').fields([{ name: 'image', maxCount: 1 }]),
    createBlog)
router.post('/admin/blog/list',authorizedAdmin,getAllBlogList)
router.post('/client/blog/list',getAllClientBlogList)
router.post('/client/blog/details',getBlogDetails)
router.post('/admin/blog/details',authorizedAdmin,getBlogDetails)
router.post('/admin/blog/remove',authorizedAdmin,removeBlog)
router.post('/admin/blog/edit',authorizedAdmin, uploadFile('./uploads/blogImages/').fields([{ name: 'image', maxCount: 1 }]),editBlog)

module.exports=router