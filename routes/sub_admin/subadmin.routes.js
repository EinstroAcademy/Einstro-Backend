const express = require("express");
const { authorizedAdmin } = require("../../middleware/authAdmin");
const { signUp, subadminList, deleteSubadmin, updateSubadmin } = require("../../controller/subadmin/subadmin");

const router = express.Router();

router.post("/create/subadmin",authorizedAdmin,signUp)
router.post("/subadmin/list",authorizedAdmin,subadminList)
router.post("/subadmin/delete",authorizedAdmin,deleteSubadmin)
router.post("/subadmin/update",authorizedAdmin,updateSubadmin)


module.exports = router