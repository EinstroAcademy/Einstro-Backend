var jwt = require('jsonwebtoken');
const Admin = require('../schema/admin.schema');
const User = require('../schema/user.schema');

const authorizedClient = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
      jwt.verify(token,process.env.JWT_SECRET, async (err, decoded) => {
        if (err || !decoded.email) {
          const data = {};
          data.response = 'Unauthorized Access -auth';
          data.message = 'Session Expired';
          data.status = '00';
          res.send(data);
        } else {
          let collection = decoded.role === 'user' ? 'users' : null;
          console.log('decode',decoded)
  
            let mainUser
            mainUser = await User.findOne({email:decoded.email})
          
            req.params.mainUserId = mainUser._id;
            req.params.mainUserData = mainUser;
            next();
        }
      });
    } else {
      res.send('Unauthorized Access');
    }
  };

  module.exports = {
    authorizedClient,
  };