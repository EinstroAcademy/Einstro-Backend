const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const session = require('express-session');
const passport = require("passport")
const blogRoutes = require('./routes/Blog/blog.routes')
const adminRoutes = require('./routes/admin/admin.routes');
const userRoutes = require('./routes/user/user.routes');
const courseRoutes = require('./routes/course/course.routes');
const googleRoutes = require('./routes/googleRoutes/google');
const path = require("path");
const queryRouter = require("./routes/Query/query.routes");
const chatRouter = require("./routes/chat/chat.routes");
const settingRouter = require('./routes/setting/setting')

require('dotenv').config();
require('./config/passport');

const PORT = process.env.PORT || 4000;

var app = express();
var server = require("http").createServer(app);

app.use(cors());
app.use(express.json());
app.use(session({
  secret:'demotest',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true
  }
}));
app.use(passport.initialize());
app.use(passport.session());





app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, adminid, userid'
  );
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/logs/error.log', express.static(path.join(__dirname, '/logs/error.log')));

app.use('/',blogRoutes)
app.use('/',adminRoutes)
app.use('/',courseRoutes)
app.use('/',googleRoutes)
app.use('/',userRoutes)
app.use('/',queryRouter)
app.use('/',chatRouter)
app.use('/',settingRouter)

mongoose.connect(
  process.env.MONGO_URI,
  {
    connectTimeoutMS: 10000, 
  }
);
mongoose.connection.on("error", function (error) {
  console.error("Error in MongoDb connection: " + error);
});

mongoose.connection.on("connected", function () {
  console.log("MongoDB connected!");
});
mongoose.connection.on("reconnected", function () {
  console.log("MongoDB reconnected!");
});
mongoose.connection.on("disconnected", function () {
  console.log("MongoDB disconnected!");
});

try {
    server.listen(PORT, function () {
      console.log('Server runing on ',PORT);
    });
  } catch (err) {
    console.log(err);
  }
