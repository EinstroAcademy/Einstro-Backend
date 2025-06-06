const express = require("express");
const {
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
  getAllUserList
 
} = require("../../controller/user/user");
const { authorizedAdmin } = require("../../middleware/authAdmin");
const { uploadFile } = require("../../middleware/uploadFile");
const { authorizedClient } = require("../../middleware/authClient");

const router = express.Router();

router.route("/user/signup").post(signUp);
router.route("/user/login").post(login);
router.route("/user/forgot/password").post(forgotPassword);
router.route("/user/verify/otp").post(verifyOtp);
router.route("/user/reset/password").post(resetPassword);
router.post("/get/user",getUser)
router.post('/update/user',authorizedClient,updateUser)
router.post('/update/user/qualification',authorizedClient,updateUserQualification)
router.post('/update/profile/pic',authorizedClient,
    uploadFile('./uploads/profilepic/').fields([{ name: 'image', maxCount: 1 }]),
    updateProfilePic)
router.post('/update/user/english/test',authorizedClient,updateEnglishTest)
router.post('/update/user/12th/details',authorizedClient,updateSchool12th)
router.post('/update/user/preferred',authorizedClient,updatePreferred)
router.post('/get/all/user/list',authorizedAdmin,getAllUserList)

module.exports = router;
