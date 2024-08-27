const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const blogRoutes = require('./routes/Blog/blog.routes')
const adminRoutes = require('./routes/admin/admin.routes');
const path = require("path");

const PORT = process.env.PORT || 4000;

var app = express();
var server = require("http").createServer(app);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/logs/error.log', express.static(path.join(__dirname, '/logs/error.log')));

app.use('/',blogRoutes)
app.use('/',adminRoutes)

mongoose.connect(
  "mongodb+srv://einstrostudyabroad:einstro@einstrocluster.qsm91si.mongodb.net/",
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
