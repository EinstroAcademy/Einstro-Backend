const express = require('express');
const { authorizedClient } = require('../../middleware/authClient');
const { authorizedAdmin } = require('../../middleware/authAdmin');
const { newSettings, updateGeminiContent, getGeminiContent } = require('../../controller/settings/setting');
const router = express.Router()


router.post('/admin/new/setting',authorizedAdmin,newSettings)
router.post('/admin/update/gemini/content',authorizedAdmin,updateGeminiContent)
router.post('/admin/get/gemini/content',authorizedAdmin,getGeminiContent)


module.exports=router