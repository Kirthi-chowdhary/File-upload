var express = require("express");

var app = express();

require("dotenv").config();
const cors = require("cors");
app.use(cors());
var bodyParser = require("body-parser");

let apirouter = require('./routers/router');
app.use('/api',apirouter)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require("dotenv").config();
var multer = require("multer");

const upload = multer();
app.use(upload.any());
var port = process.env.PORT || 8001
const url = process.env.embedingsurl;
var server = app.listen(port, function () {
  var host = server.address().address;

  var port = server.address().port;

  console.log(" app listening at http://%s:%s", host, port);
});
