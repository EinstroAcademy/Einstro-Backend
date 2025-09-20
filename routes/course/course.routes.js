const express = require("express");
const { authorizedAdmin } = require("../../middleware/authAdmin");
const {
  createSubject,
  createBranch,
  createSubjectBranch,
  getAllSubject,
  getAllBranch,
  editSubject,
  editBranch,
  removeSubject,
  removeBranch,
  getSubjects,
  getBranches,
  createCourse,
  getAllCourse,
  updateCourse,
  removeCourse,
  createUniversity,
  updateUniversity,
  removeUniversity,
  getAllUniversity,
  getUniversities,
  getCourseDetails,
  getUniversityDetails,
  clientSideBranchList,
  clientSideSubjectList,
  getAllSearchList,
  getCountryUniversity,
  getUniversityCourseList,
  createPopularCourse,
  addToFavourite,
  getFavouriteList,
  getCourse,
  getUniversity,
} = require("../../controller/course/course");
const { uploadFile } = require("../../middleware/uploadFile");
const { authorizedClient } = require("../../middleware/authClient");
const router = express.Router();

router.post("/admin/create/subject", authorizedAdmin, createSubject);
router.post("/admin/create/branch", authorizedAdmin, createBranch);
router.post("/admin/create/sub/branch", authorizedAdmin, createSubjectBranch);
router.post("/admin/get/all/subject", authorizedAdmin, getAllSubject);
router.post("/admin/get/all/branch", authorizedAdmin, getAllBranch);
router.post("/admin/course/edit/subject", authorizedAdmin, editSubject);
router.post("/admin/course/edit/branch", authorizedAdmin, editBranch);
router.post("/admin/course/remove/subject", authorizedAdmin, removeSubject);
router.post("/admin/course/remove/branch", authorizedAdmin, removeBranch);
router.post("/admin/course/get/subject", authorizedAdmin, getSubjects);
router.post("/admin/course/get/branch", authorizedAdmin, getBranches);
router.post("/client/course/get/branch", clientSideBranchList);
router.post("/client/course/get/subject", clientSideSubjectList);
router.post("/admin/create/course",authorizedAdmin, createCourse);
router.post("/admin/get/all/course",authorizedAdmin, getAllCourse);
router.post("/client/get/course/detail", getCourseDetails);
router.post("/client/get/all/course", getAllCourse);
router.post("/admin/course/update", authorizedAdmin,updateCourse);
router.post("/admin/course/remove",authorizedAdmin, removeCourse);
router.post("/admin/create/university",authorizedAdmin,uploadFile('./uploads/universityImages/').fields([{ name: 'images', maxCount: 10 },{name:'icon',maxCount:1}]), createUniversity);
router.post("/admin/update/university",authorizedAdmin,uploadFile('./uploads/universityImages/').fields([{ name: 'newImages', maxCount: 10 },{name:'icon',maxCount:1}]),updateUniversity);
router.post("/admin/university/remove", authorizedAdmin,removeUniversity);
router.post("/admin/university/list", authorizedAdmin,getAllUniversity);
router.post("/admin/all/university/list", authorizedAdmin,getUniversities);
router.post("/client/all/university/list",getUniversities);
router.post("/client/university/details",getUniversityDetails);
router.post("/client/main/search/details",getAllSearchList);
router.post("/client/university/course/list",getUniversityCourseList)
router.post("/client/country/university/list",getCountryUniversity);
router.post("/client/add/to/favourite",authorizedClient,addToFavourite);
router.post("/client/favourite/list",authorizedClient,getFavouriteList);
router.get("/get/all/list/course",getCourse);
router.get("/get/all/list/university",getUniversity);
// Popular course
router.post("/admin/add/popular/course",authorizedAdmin,uploadFile('./uploads/popularIcons/').fields([{ name: 'images', maxCount: 10 }]),createPopularCourse)
module.exports = router;
