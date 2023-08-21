
const { v4: uuidv4 } = require("uuid");
const { createCollection,deletecollection } = require("../Utils/Qdrant.js");

const sql = require("mssql");
const { deleteFolder } = require("../Utils/Resources.js");
const { getprojectInfo } = require("../Utils/SqlQueries.js");
const { deleteProjectInfo } = require("../Utils/SqlQueries.js");
const {
  getProjectInfoById,
  editProjectInfo,
  getProjectInfoByName,
  addprojectInfo,
} = require("../Utils/SqlQueries.js");
module.exports.addProjects = async (req, res) => {
  const Name = req.body.name;
  const OpenAIEndpoint = req.body.openAIEndpoint;
  const Model = req.body.model;
  const OpenAIKey = req.body.openAIKey;
  const pii = 0;
  const api = "Azure PII Mask";
  const id = uuidv4();
  const CreatedAt = new Date().toISOString();
  const CreatedBy = "SYSTEM";
  console.log(Name)
  var CollectionNameChecker = await getProjectInfoByName(Name);
  console.log(CollectionNameChecker, "exists");
  if (CollectionNameChecker.length <= 0) {
    console.log(CollectionNameChecker, "checktabledata");
    if (
      Name &&
      OpenAIEndpoint &&
      Model &&
      OpenAIKey &&
      id &&
      CreatedAt &&
      CreatedBy
    ) {
      var resp = {
        id: id,
        name: Name,
        openAIEndpoint: OpenAIEndpoint,
        openAIKey: "OpenAI Endpoint from Azure",
        model: Model,
        createdAt: CreatedAt,
        createdBy: null,
        pii: pii,
        api: api,
      };
     


    const SystemPromptTemplate =
      "You are a helpful assistant that understands context provided and answers questions truthfully by referring ONLY to the context provided and generates graceful responses..\r\n\r\nCONTEXT: [(CONTEXT)]";
    const QueryPromptTemplate =
      "Question: [(QUERY)]\n\nNote:\n- Your response MUST be provided in Markdown Format.\n- It is IMPERATIVE that your response strictly adheres to the provided context. Any deviation from the context will not be accepted.\n- In cases where an answer cannot be derived from the context, you are required to respond with 'I am sorry, I don't have an answer for that'.\n ";
const TopNChunks=5
      try {
        var resp = await addprojectInfo(
          id,
          Name,
          OpenAIEndpoint,
          OpenAIKey,
          CreatedAt,
          CreatedBy,
          Model,
          SystemPromptTemplate,
          QueryPromptTemplate,
          TopNChunks,
          api,
          pii
        );
        await createCollection(id.toUpperCase());
        res.status(200).json(resp);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
      }
    } else {
      res.status(500).json({ message: "Invalid Body" });
    }
  } else {
    res.status(403).json({ message: "Collection Exists" });
  }
};
module.exports.getProjects = async (req, res) => {
  let skip = req.query.skip;
  let limit = req.query.limit;
  try {
    if (!skip && !limit) {
      skip = 0;
      limit = 100;
    }
      var projects = await getprojectInfo(skip, limit);
      res.status(200).json(projects);
    
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
module.exports.modifyProject = async (req, res) => {
  let projectId = req.params.projectId;
  let name = req.body.name;
  let OpenAIEndpoint = req.body.openAIEndpoint;
  let OpenAIKey = req.body.openAIKey;
  let Model = req.body.model;
  let SystemPromptTemplate = req.body.systemPromptTemplate;
  let QueryPromptTemplate = req.body.queryPromptTemplate;
  let TopNChunks = req.body.topNChunks;
  let responseTone = req.body.responseTone;
  let pii = req.body.pii;
  pii = pii ? 1 : 0;
  let api = "Azure PII Mask";
  if (
    projectId &&
    name &&
    OpenAIEndpoint &&
    OpenAIKey &&
    Model &&
    SystemPromptTemplate &&
    QueryPromptTemplate &&
    TopNChunks &&
    responseTone
  ) {
    try {
      var response = await editProjectInfo(
        projectId,
        name,
        OpenAIEndpoint,
        OpenAIKey,
        Model,
        SystemPromptTemplate,
        QueryPromptTemplate,
        TopNChunks,
        responseTone,
        api,
        pii
      );
      res.status(200).json(response);
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: error });
    }
  } else {
    res.status(500).json({ message: "Invalid Body" });
  }
};

module.exports.getProjectsById = async (req, res) => {
  const projectId = req.params.id;
  console.log(projectId)
  if (projectId) {
    try {
      var projectdetails = await getProjectInfoById(projectId);
      res.status(200).json(projectdetails[0]);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(400).json("Invalid Params");
  }
};

module.exports.deleteProject = async (req, res) => {
  let projectId = req.params.projectId;

  if (projectId) {
    try {
      let containerName = process.env.containerName1;
      let connectionString = process.env.connectionString;
      await deleteProjectInfo(projectId);
      res.status(200).json("done");
      await deleteFolder(containerName, projectId, connectionString);
      await deletecollection(projectId);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  } else {
    res.status(400).json({ message: "Invalid Params" });
  }
};
