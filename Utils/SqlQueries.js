const sql = require("mssql");
require("dotenv").config();
const helpers=require('./Resources')
const config = {
  server: process.env.server,
  database: process.env.database,
  user: process.env.user,
  password: process.env.password,
  options: {
    encrypt: true,
  },
};

async function getprojectInfo(skip, limit) {
    
    const selectQuery = `SELECT *
      FROM (
        SELECT *,
          ROW_NUMBER() OVER (ORDER BY id) AS RowNum
        FROM dbo.projects
      ) AS SubQuery
      WHERE RowNum BETWEEN ${skip} AND ${parseInt(limit)} ORDER BY CreatedAt DESC;`;
  
    try {
        let pool = await sql.connect(config);
      const result = await pool.request().query(selectQuery); // Fixed the variable name 'query' to 'selectQuery'
      const selectResult = result.recordset; // Assuming 'selectResult' is available here
      var response=await helpers.CamelcaseModifier(selectResult)

      return response; // Return the converted data
    } catch (error) {
      console.log("Query execution failed:", error);
      return null;
    }
  }
  async function deleteProjectInfo(projectId)
  {
   
    try {
        let pool = await sql.connect(config);
      
    let selectQuery=`BEGIN TRANSACTION;
    DELETE FROM  dbo.ProjectFiles  WHERE ProjectId = '${projectId}';
    DELETE FROM  dbo.projects  WHERE id = '${projectId}';
    COMMIT;`
    const result = await pool.request().query(selectQuery);
    }
    catch(error)
    {
        console.log("Query execution failed:", error);
      return error;

    }

  }

async function addprojectInfo(id,Name,OpenAIEndpoint,OpenAIKey,CreatedAt,CreatedBy, Model,SystemPromptTemplate,QueryPromptTemplate, TopNChunks,api,pii)
{

    let query = `INSERT INTO Projects (Id, Name, OpenAIEndpoint, OpenAIKey, Model, CreatedAt, CreatedBy, TopNChunks, IsTraining, QueryPromptTemplate, SystemPromptTemplate, ResponseTone, api, pii)
    VALUES (@Id, @Name, @OpenAIEndpoint, @OpenAIKey, @Model, @CreatedAt, @CreatedBy, @TopNChunks, @IsTraining, @QueryPromptTemplate, @SystemPromptTemplate, @ResponseTone, @api, @pii);
    `
            let pool = await sql.connect(config);
            const response = await pool
              .request()
              .input("Id", id)
              .input("Name", Name)
              .input("OpenAIEndpoint", OpenAIEndpoint)
              .input("OpenAIKey", OpenAIKey)
              .input("Model", Model)
              .input("CreatedAt", CreatedAt)
              .input("CreatedBy", CreatedBy)
              .input("TopNChunks", TopNChunks)
              .input("IsTraining", 0)
              .input("QueryPromptTemplate", QueryPromptTemplate)
              .input("SystemPromptTemplate", SystemPromptTemplate)
              .input("ResponseTone", "none")
              .input("api", api)
              .input("pii", pii)
              .query(query);
              console.log(response,"valida")
}
async function getProjectInfoById(projectId)
{

    const selectQuery = `SELECT * FROM dbo.Projects WHERE Id = '${projectId}'`;
    try {
        let pool = await sql.connect(config);
      const result = await pool.request().query(selectQuery); // Fixed the variable name 'query' to 'selectQuery'
  
      const selectResult = result.recordset; // Assuming 'selectResult' is available here
      var response=await helpers.CamelcaseModifier(selectResult)
      return response; // Return the converted data
    } catch (error) {
      console.log("Query execution failed:", error);
      return null;
    }
}
async function editProjectInfo(projectId,name,OpenAIEndpoint,OpenAIKey, Model,SystemPromptTemplate,QueryPromptTemplate, TopNChunks, responseTone,api,pii)
{
    let selectQuery = `UPDATE dbo.Projects SET    Name = @name,
    OpenAIEndpoint = @openAiEndpint,
    OpenAIKey = @OpenAIKey,
    Model = @Model,
    SystemPromptTemplate = @SystemPromptTemplate,
    QueryPromptTemplate = @QueryPromptTemplate,
    TopNChunks = @TopNChunks,
    ResponseTone=@ResponseTone,
    api=@api,
    pii=@pii
    output inserted.*
    WHERE id = @projectId`;
    console.log("updated")
    try{
        let pool = await sql.connect(config);
        let resp = await pool
        .request()
        .input("name", name)
        .input("openAiEndpint", OpenAIEndpoint)
        .input("OpenAIKey", OpenAIKey)
        .input("Model", Model)
        .input("SystemPromptTemplate", SystemPromptTemplate)
        .input("QueryPromptTemplate", QueryPromptTemplate)
        .input("TopNChunks", TopNChunks)
        .input("projectId", projectId)
        .input("ResponseTone", responseTone)
        .input("api", api)
        .input("pii", pii)
        .query(selectQuery);
        console.log(resp.recordset,"updated")
        return resp.recordset;
    }
    catch(error)
    {
return error;
    }
    
}
async function getProjectInfoByName(Name)
{
    const selectQuery = `SELECT * from projects where Name='${Name}'`;
    try {
        let pool = await sql.connect(config);
      const result = await pool.request().query(selectQuery); // Fixed the variable name 'query' to 'selectQuery'
      const selectResult = result.recordset; // Assuming 'selectResult' is available here
     
      return selectResult; // Return the converted data
    } catch (error) {
      console.log("Query execution failed:", error);
      return null;
    }
}

async function getFileInfoByProjectId(skip, limit,projectId) {
  
  const selectQuery = ` SELECT *
  FROM [dbo].[ProjectFiles]
  WHERE [projectId] = '${projectId}'
  ORDER BY [FileName]
  OFFSET ${parseInt(skip)} ROWS
  FETCH NEXT ${parseInt(limit)} ROWS ONLY`;

  try {
      let pool = await sql.connect(config);
    const result = await pool.request().query(selectQuery); 
    const selectResult = result.recordset; 

    var response=await helpers.CamelcaseModifier(selectResult)
    return response; 
  } catch (error) {
    console.log("Query execution failed:", error);
    return null;
  }
}
async function getFileInfo(skip, limit,projectId) {
  
  const selectQuery = ` SELECT *
  FROM [dbo].[ProjectFiles]
  WHERE [Id] = '${projectId}'
  ORDER BY [FileName]
  OFFSET ${parseInt(skip)} ROWS
  FETCH NEXT ${parseInt(limit)} ROWS ONLY`;

  try {
      let pool = await sql.connect(config);
    const result = await pool.request().query(selectQuery); 
    const selectResult = result.recordset; 

    var response=await helpers.CamelcaseModifier(selectResult)
    return response; 
  } catch (error) {
    console.log("Query execution failed:", error);
    return null;
  }
}
async function deleteFileInfo(fileId)
  {
   
    try {
        let pool = await sql.connect(config);
        let selectQuery=`BEGIN TRANSACTION;
        DELETE FROM  dbo.ProjectFiles  WHERE  Id = '${fileId}';
        DELETE FROM  dbo.ProjectFileAccessList  WHERE ProjectFileId = '${fileId}';
        COMMIT;`
    const result = await pool.request().query(selectQuery);
    return result;
    }
    catch(error)
    {
        console.log("Query execution failed:", error);
      return error;

    }

  }
  async function restrictFileAccessInfo(Isprivate,fileId) {
    
    let selectQuery = `update ProjectFiles  set Isprivate=@Isprivate where Id=@Id`;
  
    try {
      let pool = await sql.connect();
      let response = await pool
        .request()
        .input("Id", fileId)
        .input("Isprivate", Isprivate)
        .query(selectQuery);
  
      return response; // Return the converted data
    } catch (error) {
      console.log("Query execution failed:", error);
      return null;
    }
  }



  async function getallowedusersInfo(fileId) {
    
    let selectQuery=
    ` SELECT
 * FROM [dbo].[ProjectFileAccessList]
WHERE
    ProjectFileId = @Id
ORDER BY [HubbleId];`
  
    try {
      let pool = await sql.connect(config);
      let response = await pool
        .request()
        .input("Id", fileId)
        .query(selectQuery);
      return response.recordset; // Return the converted data
    } catch (error) {
      console.log("Query execution failed:", error);
      return null;
    }
  }
  async function deleteallowedusersInfo(ProjectFileId,name) {

    
    let selectQuery = ` DELETE FROM [dbo].[ProjectFileAccessList]
    WHERE
        ProjectFileId = @ProjectFileId
        AND HubbleId = @HubbleId;`;

     
    try {
      let pool = await sql.connect(config);
      let resp = await pool
        .request()
        .input("ProjectFileId", ProjectFileId)
        .input("HubbleId", name)
        .query(selectQuery);
  
      return resp; 
    } catch (error) {
      console.log("Query execution failed:", error);
      return null;
    }
  }
  async function addallowedusersInfo(ProjectFileId,name) {
    
    let selectQuery = `INSERT INTO [dbo].[ProjectFileAccessList]
    (ProjectFileId, HubbleId)
VALUES
    (@ProjectFileId, @HubbleId)`;
  
    try {
      let pool = await sql.connect();
      let response = await pool
        .request()
        .input("ProjectFileId", ProjectFileId)
        .input("HubbleId", name)

        .query(selectQuery);

  
      return response.recordset; // Return the converted data
    } catch (error) {
      console.log("Query execution failed:", error);
      return null;
    }
  }
  async function sessioncheck(SessionId)

  {
    const selectQuery = `SELECT * FROM dbo.sessions WHERE sessionId = '${SessionId}'`;
  
    try {
      let pool = await sql.connect(config);
      const result = await pool.request().query(selectQuery); 
      return result.recordset; // Return the converted data
    } catch (error) {
      console.log("Query execution failed:", error);
      return null;
    }
  }
  async function sessionHistorycheck(SessionId)

  {
    const selectQuery = `SELECT  * FROM sessionhistory WHERE sessionId = '${SessionId}' ORDER BY MessageTime;`;
  
    try {
      let pool = await sql.connect(config);
      const result = await pool.request().query(selectQuery); 
      return result.recordset; // Return the converted data
    } catch (error) {
      console.log("Query execution failed:", error);
      return null;
    }
  }
  async function sessionInsert(SessionId,userId)
  {
    let selectQuery = `INSERT INTO dbo.sessions 
    VALUES (@sessionId,@userId,@type,@SessionTime,@isDeleted)`;
  

 
    try {
      let pool = await sql.connect(config);
      const response = await pool
      .request()
      .input("sessionId", SessionId)
      .input("userId", userId)
      .input("type", "Document")
      .input("SessionTime", new Date())
      .input("isDeleted", 0)
      .query(selectQuery);
      return response.recordset; // Return the converted data
    } catch (error) {
      console.log("Query execution failed:", error);
      return null;
    }
  }
  async function SessionHistory(messageId,sessionId,openairesp,queryPrompt)
  {
    let query = `INSERT INTO dbo.sessionhistory 
    VALUES (@messageId,@sessionId,@userPrompt,@ModelName,@Response,@Input,@MessageTime)`;
    try{
  let pool = await sql.connect(config);
  
  const response = await pool
    .request()
    .input("messageId", messageId)
    .input("sessionId", sessionId)
    .input("userPrompt", "")
    .input("ModelName", "Gpt-35")
    .input("Response", openairesp)
    .input("Input",queryPrompt)
    .input("MessageTime", new Date())
    .query(query);
    }
    catch(error)
    {
      console.log(error)
    }
  }
  async function updatedIsTraining(projectId) {
    
    const updateSelectQuery = `
    UPDATE dbo.projects
    SET IsTraining = 1
    OUTPUT INSERTED.IsTraining AS UpdatedIsTraining
    WHERE Id = '${projectId}'
  `;
  
    try {
      let pool = await sql.connect(config);
      let response = await pool
        .request().query(updateSelectQuery);
      return response.recordset; // Return the converted data
    } catch (error) {
      console.log("Query execution failed:", error);
      return null;
    }
  }

  async function getProjectFilesInfoById(projectId)
{
  const selectQuery = `SELECT * FROM dbo.ProjectFiles WHERE ProjectId = '${projectId}' and Processed=0 `;
    try {
        let pool = await sql.connect(config);
      const result = await pool.request().query(selectQuery); // Fixed the variable name 'query' to 'selectQuery'
          result.recordset; // Assuming 'selectResult' is available here
      return result.recordset;
    
    
      // Return the converted data
    } catch (error) {
      console.log("Query execution failed:", error);
      return null;
    }
}
async function UpdateFileStatus(projectId) {
    
  const updateQuery = `UPDATE dbo.projects SET IsTraining = 0 WHERE Id = '${projectId}'`;

  try {
      let pool = await sql.connect(config);
    const result = await pool.request().query(updateQuery); // Fixed the variable name 'query' to 'selectQuery'
    return true; // Return the converted data
  } catch (error) {
    console.log("Query execution failed:", error);
    return null;
  }
}
async function updateFileProcessStatus(ProcessStatus,FileId) {
    console.log("????????///")
  const updateQuery = `UPDATE dbo.ProjectFiles
          SET Processed = '${ProcessStatus}'
          WHERE  Id='${FileId}' `;

  try {
      let pool = await sql.connect(config);
    const result = await pool.request().query(updateQuery); // Fixed the variable name 'query' to 'selectQuery'

    return result; // Return the converted data
  } catch (error) {
    console.log("Query execution failed:", error);
    return null;
  }
}
async function updateProjectFilesProcessStatus(ProcessStatus,FileId) {
  console.log("????????///")
const updateQuery = `UPDATE dbo.ProjectFiles
        SET Processed = '${ProcessStatus}'
        WHERE  ProjectId='${FileId}' `;

try {
    let pool = await sql.connect(config);
  const result = await pool.request().query(updateQuery); // Fixed the variable name 'query' to 'selectQuery'

  return result; // Return the converted data
} catch (error) {
  console.log("Query execution failed:", error);
  return null;
}
}
async function AccessCheck(HubbleId,projectId)
{
  const selectQuery = `SELECT pf.*, pfl.*
  FROM ProjectFiles pf
  Left JOIN ProjectFileAccessList pfl ON pf.Id = pfl.projectFileid
  WHERE (pf.isprivate = 0 OR pfl.hubbleid = '${HubbleId}') AND pf.projectid ='${projectId}'`;


    try {
        let pool = await sql.connect(config);
      const result = await pool.request().query(selectQuery); // Fixed the variable name 'query' to 'selectQuery'
      const selectResult = result.recordset; // Assuming 'selectResult' is available here
     
var accessfiles = selectResult.map((result) => result.Id);
    
      return accessfiles; // Return the converted data
    } catch (error) {
      console.log("Query execution failed:", error);
      return null;
    }
}
async function TrainststatusProgress(projectId)
{
  const selectQuery = `SELECT
  COUNT(Id) AS TotalUnits,
  COUNT(CASE WHEN Processed = 1 THEN 1 END) AS ProcessedUnits
FROM dbo.ProjectFiles
WHERE
ProjectId = '${projectId}'
`;


  try {
      let pool = await sql.connect(config);
    const result = await pool.request().query(selectQuery); 
    return result.recordset; 
  } catch (error) {
    console.log("Query execution failed:", error);
    return null;
  }
}

async function uploadPdfFieInfo(
  fileId,
  originalname,
  blobName,
  projectId,
  fileType
) {
  const query = `INSERT INTO dbo.ProjectFiles  
  VALUES (@Id,@FileName,@FileRelativeURL,@ProjectId,@Processed,@Isprivate,@Type)`;
  try {
    let pool = await sql.connect(config);
    const response = await pool
      .request()
      .input("Id", fileId)
      .input("FileName", originalname)
      .input("FileRelativeURL", blobName)
      .input("ProjectId", projectId)
      .input("Processed", 0)
      .input("Isprivate", 0)
      .input("Type", fileType)
      .query(query);

    console.log(response, "valida");
  } catch (error) {
    console.log(error);
  }
}
async function PdfSplitFilesInfo(
  splitFileId,
  mainPDFId,
  originalname,
  splitFileBlobName,
  i,
  projectId,
  startPageNumber,
  fileType
) {
  const query = `INSERT INTO dbo.PdfSplitFiles 
  VALUES (@Id,@ProjectFileId,@SplitFileName,@FileRelativeURL,@ProjectId,@Processed,@Isprivate,@StartPageNumber,@MainFileName,@Type)`;
  try {
    let pool = await sql.connect(config);
    let response = await pool
      .request()
      .input("Id", splitFileId)
      .input("ProjectFileId", mainPDFId)
      .input("SplitFileName", i + 1 + "_" + originalname)
      .input("FileRelativeURL", splitFileBlobName)
      .input("ProjectId", projectId)
      .input("Processed", 0)
      .input("Isprivate", 0)
      .input("StartPageNumber", startPageNumber)
      .input("MainFileName", originalname)
      .input("Type", fileType)

      .query(query);
    console.log(response, "valida")
    return response
  } catch (error) {
    console.log(error);
  }
}
module.exports.updateProjectFilesProcessStatus=updateProjectFilesProcessStatus
module.exports.sessionHistorycheck=sessionHistorycheck
module.exports.SessionHistory=SessionHistory
module.exports.getFileInfoByProjectId=getFileInfoByProjectId
module.exports.uploadPdfFieInfo=uploadPdfFieInfo
module.exports.TrainststatusProgress=TrainststatusProgress
module.exports.AccessCheck=AccessCheck
module.exports.updateFileProcessStatus=updateFileProcessStatus
module.exports.UpdateFileStatus=UpdateFileStatus
module.exports.getProjectFilesInfoById=getProjectFilesInfoById
  module.exports.updatedIsTraining=updatedIsTraining
  module.exports.sessioncheck=sessioncheck
  module.exports.sessionInsert=sessionInsert
module.exports.getprojectInfo=getprojectInfo
module.exports.deleteProjectInfo=deleteProjectInfo
module.exports.getProjectInfoById=getProjectInfoById
module.exports.editProjectInfo=editProjectInfo
module.exports.getProjectInfoByName=getProjectInfoByName
module.exports.addprojectInfo=addprojectInfo
module.exports.getFileInfo=getFileInfo
module.exports.deleteFileInfo=deleteFileInfo
module.exports.restrictFileAccessInfo=restrictFileAccessInfo
module.exports.getallowedusersInfo=getallowedusersInfo
module.exports.deleteallowedusersInfo=deleteallowedusersInfo
module.exports.addallowedusersInfo=addallowedusersInfo
module.exports.PdfSplitFilesInfo = PdfSplitFilesInfo