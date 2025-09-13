const express = require("express");
const {
  signUp,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getAdminDetails,
  updateAdminDetails,
  adminUpdatePassword,
  updateAdminProfileImage,
  removeProfilePic,
  approveImage,
} = require("../../controller/admin/admin");
const { authorizedAdmin } = require("../../middleware/authAdmin");
const { uploadFile } = require("../../middleware/uploadFile");

const router = express.Router();


router.route("/admin/create/user").post(signUp);
router.route("/admin/login").post(login);
router.route("/admin/forgot/password").post(forgotPassword);
router.route("/admin/verify/otp").post(verifyOtp);
router.route("/admin/reset/password").post(resetPassword);
router.post("/admin/details", authorizedAdmin, getAdminDetails);
router.post("/admin/update/details", authorizedAdmin, updateAdminDetails);
router.post("/admin/change/password", authorizedAdmin, adminUpdatePassword);
router.post(
  "/admin/profile/image/update",
  authorizedAdmin,
  uploadFile("./uploads/adminImages/").fields([{ name: "image", maxCount: 1 }]),
  updateAdminProfileImage
),
  router.post("/admin/profile/remove/image", authorizedAdmin, removeProfilePic);
  router.post("/admin/user/approve/image", authorizedAdmin, approveImage);

module.exports = router;
