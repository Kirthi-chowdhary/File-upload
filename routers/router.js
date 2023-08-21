const express = require("express");
console.log("enter into the router");
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
var router = express.Router();
var multer = require("multer");
const upload = multer();
function checkAccessKey(req, res, next) {
  const accessKey = req.headers['access-key'];

  const validAccessKey = process.env.accesskey

  if (accessKey !== validAccessKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  else if(!accessKey)
  {
    return res.status(400).json({ error: 'Include Access-key In Headers' });
  }
  next();
}
router.use( upload.any(), jsonParser, (req, res, next) => {
  return next();
});
require('./chat.router')(router);

module.exports = router;
