
const {getallowedusersInfo,deleteallowedusersInfo,addallowedusersInfo}=require('../Utils/SqlQueries.js')
const sql = require("mssql");
module.exports.allowedusers = async (req, res) => {
  let projectId = req.params.projectId;
  let ProjectFileId = req.params.fileId;

  if (projectId && ProjectFileId) {
    try {
   var aceessusers=await getallowedusersInfo(ProjectFileId)
   console.log(aceessusers,"connnss")
   var conversionarray=[]

   for(var i=0;i<aceessusers.length;i++)
   {
    conversionarray.push({
        projectFileId:aceessusers[i].ProjectFileId,hubbleId:aceessusers[i].HubbleId
    })
   }
   console.log(conversionarray,"cccccccccccccccccccccc")
   res.status(200).json(conversionarray);
     
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: error });
    }
  } else {
    res.status(500).json({ message: "Invalid Body" });
  }
};
module.exports.deleteallowedusers = async (req, res) => {
  let projectId = req.params.projectId;
  let ProjectFileId = req.params.fileId;

  let name = req.body.hubbleId;

  if (projectId && name && ProjectFileId) {
    try {
        var resp=deleteallowedusersInfo(ProjectFileId,name)
      res.status(200).json(resp.recordset);
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: error });
    }
  } else {
    res.status(500).json({ message: "Invalid Body" });
  }
};
module.exports.addallowedusers = async (req, res) => {
  let projectId = req.params.projectId;
  let ProjectFileId = req.params.fileId;
  let name = req.body.hubbleId;

  if (projectId && name && ProjectFileId) {
    try {
     var resp=addallowedusersInfo(ProjectFileId,name)

      res.status(200).json(resp.recordset);
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: error });
    }
  } else {
    res.status(500).json({ message: "Invalid Body" });
  }
};
const { v4: uuidv4 } = require("uuid");
module.exports.Chatusers = async (req, res) => {
  let Name = req.body.Name;
  let Email = req.body.Email;
  let Phone = req.body.Phone;
  const id = uuidv4();
  const CreatedAt = new Date().toISOString();
  if (Name && Email && Phone) {
    try {
   
      const insertQuery = `select * from [dbo].[ChatUsers]`;
      const result = await db.executeQuery(insertQuery);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  } else {
    res.status(500).json({ message: "Invalid Body" });
  }
};
