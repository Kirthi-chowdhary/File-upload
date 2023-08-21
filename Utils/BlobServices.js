require("dotenv").config();
const { BlobServiceClient } = require("@azure/storage-blob");
async function uploadBytesToBlobStorage(containerName, blobName, bytes) {
    const connectionString = process.env.connectionString;
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      connectionString
    );
    const containerClient = blobServiceClient.getContainerClient(
      containerName
    );
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(bytes);
  }
 
  async function uploadTextToBlobStorage(text, projectId, chunkId) {

    const connectionString = process.env.connectionString;
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  
  
    const containerClient = blobServiceClient.getContainerClient(process.env.containerName1);
  
  
    const blockBlobClient = containerClient.getBlockBlobClient(projectId+"/"+chunkId+".txt");
  
  
    await blockBlobClient.upload(text, text.length);
  
    console.log("Text uploaded to Azure Blob Storage successfully.");
  }
  module.exports.uploadBytesToBlobStorage=uploadBytesToBlobStorage
  module.exports.uploadTextToBlobStorage=uploadTextToBlobStorage