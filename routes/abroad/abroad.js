const express = require('express');
const { authorizedAdmin } = require('../../middleware/authAdmin');
const {uploadFile} = require('../../middleware/uploadFile');
const { createAbroad, getAllAbroadList, getAbroadDetails, updateAbroad, getAbroadClientDetails } = require('../../controller/abroad/abroad');
const router = express.Router()


router.post('/admin/create/abroad',authorizedAdmin,
    uploadFile('./uploads/abroadImages/').fields([
        { name: 'head_img', maxCount: 1 },
        {name:'sec_img',maxCount:1},
        {name:'country_img',maxCount:1},
    ]),
    createAbroad)
router.post('/admin/abroad/list',authorizedAdmin,getAllAbroadList)
router.post('/client/abroad/list',getAllAbroadList)
router.post('/admin/abroad/detail',authorizedAdmin,getAbroadDetails)
router.post('/client/abroad/detail',getAbroadClientDetails)
router.post('/admin/update/abroad/:abroad_id',authorizedAdmin,
    uploadFile('./uploads/abroadImages/').fields([
        { name: 'head_img', maxCount: 1 },
        {name:'sec_img',maxCount:1},
        {name:'country_img',maxCount:1},
    ]),
    updateAbroad)


module.exports=router