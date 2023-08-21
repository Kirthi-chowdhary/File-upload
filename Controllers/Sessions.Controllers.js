
const { v4: uuidv4 } = require("uuid");
const { UuidGeneration } = require('../Utils/Resources.js')
const { sessioncheck, sessionInsert } = require('../Utils/SqlQueries.js')
const sql = require('mssql')
module.exports.SessionsId = async (req, res) => {
  console.log("calling")
  var userId = req.headers.hubbleid;

  let SessionId;


  if (userId) {
    try {
      SessionId = await UuidGeneration()
      let selectResult = await sessioncheck(SessionId)
      if (selectResult.length > 0) {

        await UuidGeneration()
      }
      else {
        await sessionInsert(SessionId, userId)
        res.status(200).json({ SessionId: SessionId });
      }

    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(500).json("Invalid Headers");
  }
};
