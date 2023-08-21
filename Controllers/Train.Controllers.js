
const { deleteFolder } = require("../Utils/Resources.js");
const { generateNumbers, FileUrlChanger, splitTraning } = require('../Utils/Resources.js')
const { getProjectInfoById, updatedIsTraining, getProjectFilesInfoById, UpdateFileStatus } = require('../Utils/SqlQueries.js')
const { TrainststatusProgress, updateProjectFilesProcessStatus } = require('../Utils/SqlQueries.js')
const {deleteCollectionByProjectId}=require('../Utils/Qdrant.js')
module.exports.train = async (req, res) => {
  let projectId = req.params.projectId;


  if (projectId) {
    try {
      var projectInfo = await getProjectInfoById(projectId)
      if (projectInfo[0].isTraining == false) {
        let updateResult = await updatedIsTraining(projectId)
        console.log(updateResult,"updaters")
        const IsTrainingStatus = updateResult[0]?.UpdatedIsTraining;
        console.log(IsTrainingStatus,"chec")
        res.status(200).json({ message: IsTrainingStatus });
        var selectResult = await getProjectFilesInfoById(projectId)
        var convertedData = await FileUrlChanger(selectResult)
        //Parllel Processing
        if (convertedData.length > 5) {
          var ArrayofSplitFiles =  generateNumbers(convertedData.length);
          for (var i = 0; i < ArrayofSplitFiles.length - 1; i++) {
            await splitTraning(convertedData, ArrayofSplitFiles[i], ArrayofSplitFiles[i + 1], projectId);
            await UpdateFileStatus(projectId)
          }
        } else {
          console.log("Inside Else")
          await splitTraning(convertedData, 0, convertedData.length, projectId);
          await UpdateFileStatus(projectId)
        }
      }
      else {
        res.status(200).json({ message: "TrainingInProgress" })
      }
    } catch (error) {
      res.status(500).json({ messsage: error });
    }
  } else {
    res.status(400).json("Invalid Project Id");
  }
};
module.exports.trainingStatus = async (req, res) => {
  let projectId = req.params.id;

  if (projectId) {
    try {
      var selectResult = await TrainststatusProgress(projectId)
      let totalper =
        (selectResult[0].ProcessedUnits / selectResult[0].TotalUnits) * 100;
      selectResult[0]["progessPercentage"] = Math.floor(totalper);
      console.log(selectResult[0]);
      res.status(200).json(selectResult[0]);
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: error });
    }
  } else {
    res.status(500).json({ message: "Invalid Body" });
  }
};


module.exports.resetTraining = async (req, res) => {
  let id = req.params.id;
  console.log(id);
  const connectionString = process.env.connectionString;
  const containerName = process.env.containerName1;

  if (id) {
    try {

      try {
        await deleteCollectionByProjectId(id)
        await deleteFolder(containerName, id, connectionString)
          .then(async () => {
            console.log("Folder deleted successfully.");
            selectResult = await updateProjectFilesProcessStatus(0, id)
            res.status(200).json(selectResult);
          })
          .catch((error) => {
            console.error("An error occurred:", error);
          });
      } catch (error) {
        res.status(500).json({ message: error });
      }
    } catch (error) {
      res.status(500).json({ message: error });
    }
  } else {
    res.status(400).json({ message: "Invalid Body" });
  }
};
