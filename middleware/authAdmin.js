var jwt = require('jsonwebtoken');
const Admin = require('../schema/admin.schema');

const authorizedAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
      jwt.verify(token,process.env.JWT_SECRET, async (err, decoded) => {
        if (err || !decoded.email) {
          const data = {};
          data.response = 'Unauthorized Access';
          data.message = 'Session Expired';
          data.status = '00';
          res.send(data);
        } else {
          let collection = decoded.role === 'admin' ? 'admins' : null;
  
            let mainAdmin
            

            if(collection==='admins'){
                mainAdmin = await Admin.findOne({email:decoded.email})
            }

          if (collection === null) {
            const data = {};
            data.response = 'Unauthorized Access';
            data.status = '00';
            res.send(data);
          } else {
            req.params.mainAdminId = mainAdmin._id;
            req.params.mainAdminData = mainAdmin;
            next();
          }
        }
      });
    } else {
      res.send('Unauthorized Access');
    }
  };

  module.exports = {
    authorizedAdmin,
  };