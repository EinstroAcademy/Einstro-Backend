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
  getAllUserList,
  createStudent,
  updateUserQualificationAdmin,
  getStudentDetails,
  updateUserSchoolAdmin,
  createDocumentRecord,
  removeUserQualificationAdmin,
  removeUserSchoolAdmin
 
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
router.post('/update/user/school/details',authorizedClient,updateSchool12th)
router.post('/update/user/preferred',authorizedClient,updatePreferred)
router.post('/update/user/upload/documents', 
    authorizedClient,
    uploadFile('./uploads/documents/').fields([
        { name: 'class10', maxCount: 1 },
        { name: 'class12', maxCount: 1 },
        { name: 'degree', maxCount: 1 },
        { name: 'aadhaarFront', maxCount: 1 },
        { name: 'aadhaarBack', maxCount: 1 },
        { name: 'passportFirst', maxCount: 1 },
        { name: 'passportLast', maxCount: 1 },
        { name: 'birthCertificate', maxCount: 1 }
    ]),
    createDocumentRecord
);
router.post('/get/all/user/list',authorizedAdmin,getAllUserList)
router.post('/admin/create/new/user',authorizedAdmin,createStudent)
router.post('/admin/update/user/qualification',authorizedAdmin,updateUserQualificationAdmin)
router.post('/admin/update/user/school',authorizedAdmin,updateUserSchoolAdmin)
router.post('/admin/get/user',authorizedAdmin,getStudentDetails)
router.post('/admin/user/upload/documents', 
    authorizedAdmin,
    uploadFile('./uploads/documents/').fields([
        { name: 'class10', maxCount: 1 },
        { name: 'class12', maxCount: 1 },
        { name: 'degree', maxCount: 1 },
        { name: 'aadhaarFront', maxCount: 1 },
        { name: 'aadhaarBack', maxCount: 1 },
        { name: 'passportFirst', maxCount: 1 },
        { name: 'passportLast', maxCount: 1 },
        { name: 'birthCertificate', maxCount: 1 }
    ]),
    createDocumentRecord
);
router.post('/admin/user/remove/qualification',authorizedAdmin,removeUserQualificationAdmin)
router.post('/admin/user/remove/school',authorizedAdmin,removeUserSchoolAdmin)
module.exports = router;
