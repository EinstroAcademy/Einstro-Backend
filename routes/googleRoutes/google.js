const express = require('express');
const passport = require('passport');
const router = express.Router();
const googleAuth = require('./../../middleware/googleAuth');

router.get('/', googleAuth.home);

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => res.redirect('/auth/profile')
);

router.get('/auth/profile', googleAuth.loginSuccess);

router.get('/auth/logout', googleAuth.logout);

module.exports = router;