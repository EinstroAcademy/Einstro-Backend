const express = require('express')
const { signUp, login, forgotPassword, verifyOtp, resetPassword } = require('../../controller/admin/admin')

const router = express.Router()

router.route('/admin/create/user').post(signUp)
router.route('/admin/login').post(login)
router.route('/admin/forgot/password').post(forgotPassword)
router.route('/admin/verify/otp').post(verifyOtp)
router.route('/admin/reset/password').post(resetPassword)

module.exports=router