
require("dotenv").config();
const {deleteFileInfo,getFileInfoByProjectId,restrictFileAccessInfo}=require('../Utils/SqlQueries.js')
const {ProcessUploadedFile}=require('../Utils/Resources.js')
const {deleteCollectionById}=require('../Utils/Qdrant.js')
module.exports.getFiles = async (req, res) => {
  const projectId = req.params.projectId;
  let skip = req.query.skip;
  let limit = req.query.limit;
  if (projectId) {
    try {
      if (!skip && !limit) {
        skip = 0;
        limit = 5;
      }
      var filesdata = await getFileInfoByProjectId(skip, limit, projectId);
      filesdata.map((item, index) => {
        item["fileAbsoluteURL"] = process.env.bloburl + item["fileRelativeURL"];
      });
      res.status(200).json(filesdata);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  } else {
    res.status(500).json("Invalid ProjectId");
  }
};
module.exports.deleteFile = async (req, res) => {
  let projectId = req.params.projectId;
  let fileId = req.params.fileId;
  if (projectId && fileId) {
    try {
      var deletedinfo = await deleteFileInfo(fileId);
      await deleteCollectionById(projectId,fileId)
      res.status(200).json(deletedinfo);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  } else {
    res.status(500).json({ message: "Invalid Body" });
  }
};
module.exports.uploadFiles = async (req, res) => {

  let data = req.files;
  let projectId = req.params.projectId;
  if (data) {
await ProcessUploadedFile(data,projectId)
    res.status(200).json({ data: "uploaded" });
  } else {
    res.status(500).json({ message: "There is no data to process" });

  }
};
module.exports.restrictFileAccess = async (req, res) => {
  let fileId = req.params.fileId;
  let Istraining=req.body.IsPrivate
  if (fileId) {
    try {
     var response=await restrictFileAccessInfo(Istraining,fileId)
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  } else {
    res.status(500).json({ message: "Invalid Body" });
  }
};
