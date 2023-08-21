const { embedding } = require("../Utils/OpenAiServices.js");
const { azureopenai } = require("../Utils/OpenAiServices.js");
const { SessionHistory } = require("../Utils/SqlQueries.js");
const { searchCollection } = require("../Utils/Qdrant.js");
const { getChunkdataFromBlob } = require("../Utils/Resources.js");
const {
  AccessCheck,
  getProjectInfoById,
  getFileInfo,
} = require("../Utils/SqlQueries.js");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const connectionString = process.env.connectionString;
let containerName = process.env.containerName1;
module.exports.query = async (req, res) => {
  console.log("queryenter");
  var input = req.body.query;
  var fetchfile = req.body.contextFile;
  var projectId = req.params.id;
  var HubbleId = req.headers.hubbleid;
  let sessionId = req.body.sessionId;

  var Filesinfo = [];
  let res1;

  try {
    var accesscheckResult = await AccessCheck(HubbleId, projectId);
    console.log(accesscheckResult);
    var Project = await getProjectInfoById(projectId);

    var embeddingValues = await embedding(input);
    res1 = await searchCollection(
      projectId,
      embeddingValues[0],
      accesscheckResult,
      fetchfile
    );
    var qdbdatares = res1.result;
    console.log(qdbdatares,"qdb")
    let listOfChunks = [];
    async function getfilesdata(qdbdatares, projectId) {
      return Promise.all(
        qdbdatares.map(async (item) => {
          var ProjectFilesdata = await getFileInfo(
            0,
            200,
            item.payload.ProjectFileId
          );

          var resultfrom = await getChunkdataFromBlob(
            item.payload.ChunkId,
            item.payload.ProjectFileId,
            projectId,
            connectionString,
            containerName
          );
          console.log(resultfrom)
          listOfChunks.push(resultfrom);
          return {
            ProjectFileId: item.payload.ProjectFileId,
            fileAbsoluteURL:
              process.env.bloburl +
              item.payload.ProjectFileId.toLowerCase() +
              ".pdf" +
              "?" +
              process.env.token,
            fileName: ProjectFilesdata[0].fileName,
            pageNumbers: [item.payload.pageNumber],
          };
        })
      );
    }

    var data = await getfilesdata(qdbdatares,projectId);
    var outputArray;
    if (fetchfile) {
      data = [];
    } else {
      var inputArray = data;
      function groupBy(arr, property) {
        return arr.reduce((acc, obj) => {
          const key = obj[property];
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(obj);
          return acc;
        }, {});
      }

      // Group the objects by ProjectFileId
      const groupedByProjectFileId = groupBy(inputArray, "ProjectFileId");

      outputArray = Object.values(groupedByProjectFileId).map((group) => ({
        ...group[0],
        pageNumbers: group.flatMap((obj) => obj.pageNumbers),
      }));
    }

    var finaldata = await azureopenai(
      listOfChunks,
      input,
      HubbleId,
      Project,
      sessionId
    );
    let messageId = uuidv4();
    if (sessionId) {
      await SessionHistory(messageId, sessionId, input, finaldata);
    }

    res.status(200).json({
      response: finaldata,
      references: outputArray,
    });

    console.log(finaldata, "finaldata");
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
