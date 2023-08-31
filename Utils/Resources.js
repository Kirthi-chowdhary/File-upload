
const { v4: uuidv4 } = require("uuid");
const mammoth = require('mammoth');
const officegen = require('officegen');
const fs = require('fs');
const updatequery = require("./SqlQueries");
const axios=require('axios')
const { BlobServiceClient } = require("@azure/storage-blob");
const {uploadBytesToBlobStorage,uploadTextToBlobStorage}=require("./BlobServices");
const {
  AzureKeyCredential,
  DocumentAnalysisClient,
} = require("@azure/ai-form-recognizer");
const sql = require("mssql");
const { Readable } = require("stream");
var path = require("path");
const PDFDocument = require("pdf-lib").PDFDocument;
// const multipart = require("parse-multipart");
require("dotenv").config();
const key = process.env.key;
const headers = {
  "api-key": key,
  "Content-Type": "application/json",
};
const {embedding}=require('../Utils/OpenAiServices')
const {readFile}=require('../Utils/Formrecognizer')
const {upsertPoints}=require('../Utils/Qdrant')
const url = process.env.embedingsurl;
const containerName = process.env.containerName;
async function CamelcaseModifier(selectResult)
{
    const convertFirstLetterToLower = (obj) => {
        const convertedObj = {};
        for (let key in obj) {
          const lowerKey = key.charAt(0).toLowerCase() + key.slice(1);
          convertedObj[lowerKey] = obj[key];
        }
        return convertedObj;
      };
      const convertedData = selectResult.map(convertFirstLetterToLower);
      
      return convertedData;
}

async function generateNumberArray(start, end) {
  const array = [];

  for (let i = start; i < end; i++) {
    array.push(i);
  }

  return array;
}



module.exports.generateNumberArray=generateNumberArray
module.exports.CamelcaseModifier=CamelcaseModifier
async function CamelcaseModifier1(aceessusers)
{
  const convertFirstLetterToLower = (obj) => {
    const convertedObj = {};
    for (let key in obj) {
      const lowerKey = key.charAt(0).toLowerCase() + key.slice(1);
      convertedObj[lowerKey] = obj[key];
    }
    return convertedObj;
  };

  const convertedData = aceessusers.recordset.map(convertFirstLetterToLower);
  return convertedData;
}
module.exports.CamelcaseModifier1=CamelcaseModifier1
async function UuidGeneration()
{

    let SessionId = uuidv4();

    return SessionId;
   
}
module.exports.UuidGeneration=UuidGeneration
function generateNumbers(value) {
  var start = 0;
  var end = value;
  var temp = [];

  for (var start = start; start <= end; start = start + 5) {
    temp.push(start);
  }

  var a = start - 5 + end - (start - 5);

  temp.push(a);


  return temp;
}
async function FileUrlChanger(selectResult)
{
    const convertFirstLetterToLower = (obj) => {
        const convertedObj = {};
        for (let key in obj) {
          const lowerKey = key.charAt(0).toLowerCase() + key.slice(1);
          convertedObj[lowerKey] = obj[key];
        }
        return convertedObj;
      };
      const convertedData = selectResult.map(convertFirstLetterToLower);
      convertedData.map((item, index) => {
        item["fileAbsoluteURL"] = process.env.bloburl + item["fileRelativeURL"];
      });
      return convertedData;
}
async function generateChunks(value) {
  let text = value;
  let chunks = [];
  let currentChunk = "";

  text.split(".").forEach((line) => {
    const sentence = line + ". ";

    if (currentChunk.length + sentence.length < 1500) {
      currentChunk += sentence;
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  });

  if (currentChunk.trim() !== "") {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}


async function splitTraning(convertedData,startIndex,endIndex,projectId) {
  await Promise.all(
    convertedData.slice(startIndex, endIndex + 1).map(async (data) => {
      var fileContent = await readFile(data.fileAbsoluteURL);
      var pageNumbers = Object.keys(fileContent);
      var pagecontent = Object.values(fileContent);

      await Promise.all(
        pageNumbers.map(async (pageNumber, i) => {
          var result = await generateChunks(pagecontent[i]);
          await Promise.all(
            result.map(async (content) => {
              let ChunkId = uuidv4();
              await uploadTextToBlobStorage(content, projectId, ChunkId);
            function mySetTimeout(callback, delay) {
setTimeout(callback, delay);
} 
mySetTimeout(() => {
console.log("This message will appear after 2000 milliseconds (2 seconds).");
}, 10000);
console.log("This message will appear immediately.");
              var embedvalue = await embedding(content);
              await upsertPoints(
                embedvalue[0],
                projectId,
                ChunkId,
                i + 1,
                data.id
              );
              console.log(data.id,"fileiD")
              await updatequery.updateFileProcessStatus(1,data.id)

            })
          );
        })
      );
    })
  );
}
async function getfilesdata(qdbdatares) {
  return Promise.all(
    qdbdatares.map(async (item) => {
      console.log(item.payload.ChunkId,"ssssssssss")
      var ProjectFilesdata=await getFileInfo(0,200,item.payload.ProjectFileId)
      console.log(ProjectFilesdata)
      await getChunkdataFromBlob(item.payload.ChunkId, item.payload.ProjectFileId);
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
function generateNumberArray(start, end) {
  const array = [];

  for (let i = start; i < end; i++) {
    array.push(i);
  }

  return array;
}
async function ProcessUploadedFile(data,projectId)
{
  let templatechunks = [];
  for (const result of data) {
    let fileType = result.mimetype.split("/")[1];
    console.log("fileType", fileType);
    var extension = path.extname(result.originalname);
    var fileContent = result.buffer;
    // let fileStream = Readable.from(fileContent);
    console.log(result.originalname)

    const pageCount = 10;
    let splitIndex = 0;
    let mainPDFId = uuidv4();
    console.log("mainFileId : ", mainPDFId);
    // let mainPDFBlobName = mainPDFId + ".pdf";
    let mainPDFBlobName = `${mainPDFId}.${fileType}`;
    console.log(
      "UPLOADING SPLIT PDF WHOS ID is mainPDFBlobName : ",
      mainPDFBlobName
    );
    // await uploadBytesToBlobStorage(containerName, mainPDFBlobName, fileContent);
    // if(fileType != 'vnd.openxmlformats-officedocument.wordprocessingml.document'){
    //   await updatequery.uploadPdfFieInfo(
    //     mainPDFId,
    //     result.originalname,
    //     mainPDFBlobName,
    //     projectId,
    //     fileType
    //   );
    // }else{
    //   await updatequery.uploadPdfFieInfo(
    //     mainPDFId,
    //     result.originalname,
    //     mainPDFBlobName,
    //     projectId,
    //     'docx'
    //   );
    // }
    

    if (fileType == "pdf") {
      const pdfDoc = await PDFDocument.load(fileContent);
      const numberOfPages = pdfDoc.getPages().length;
      async function SplitPdfFile() {
        for (let start = 0; start < numberOfPages; start += pageCount) {
          const end = Math.min(start + pageCount, numberOfPages);
          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(
            pdfDoc,
            generateNumberArray(start, end)
          );

          copiedPages.forEach((page) => {
            newPdf.addPage(page);
          });

          const outputPdfBytes = await newPdf.save();
          templatechunks.push({
            startPageNumber: start + 1,
            splitPDFBytes: outputPdfBytes,
          });
          splitIndex++;
        }
      }

      await SplitPdfFile();
      const promises = templatechunks.map(async (templatechunk, i) => {
        try {
          let fileId = uuidv4().toUpperCase();

          let blobName = `${fileId}.${fileType}`;
          await uploadBytesToBlobStorage(
            containerName,
            blobName,
            templatechunk.splitPDFBytes
          );

          await updatequery.PdfSplitFilesInfo(
            fileId,
            mainPDFId,
            result.originalname,
            blobName,
            i,
            projectId,
            templatechunk.startPageNumber,
            fileType
          );
          console.log(fileId);

          console.log("\n query Sucess Response SPLIT PDF UPLOADED INTO DB : ");
        } catch (error) {
          console.log(error);
          throw error;
        }
      });
    } else if (fileType == "html") {
      console.log("fileType", fileType);
      let fileId = uuidv4().toUpperCase();
      console.log("fileId", fileId);
      let blobName = `${fileId}.${fileType}`;
      await updatequery.PdfSplitFilesInfo(
        fileId,
        mainPDFId,
        result.originalname,
        blobName,
        0,
        projectId,
        1,
        fileType
      );
    }else if (fileType == 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const result = await mammoth.extractRawText({ buffer: fileContent });
        const text = result.value;

        // Split DOCX content into parts
        const parts = splitDocxIntoParts(text);
        

        // Generate and upload each part
        const promises = parts.map(async (templatechunk, i) => {
          let fileId = uuidv4().toUpperCase();
          let blobName = `${fileId}.${fileType}`;
          console.log(fileId)

          const bytes = Buffer.from(templatechunk, 'utf-8');
        
          try {
            await uploadBytesToBlobStorage(containerName, blobName, bytes);
            await updatequery.PdfSplitFilesInfo(
              fileId,
              mainPDFId,
              result.originalname,
              blobName,
              i,
              projectId,
              1,
              'docx'
            );
          } catch (error) {
            console.log(error);
            throw error;
          }
        });
        try {
      
          const responses = await Promise.all(promises);
          
        } catch (error) {
          // res.status(500).json({ message: error });
        }

      } catch (error) {
        console.log(error);
        throw error;
      }
    } else {
      let fileId = uuidv4().toUpperCase();
      console.log("fileId", fileId);
      console.log(mainPDFId, "urlmainfile");
      let blobName = `${fileId}.${fileType}`;
      await updatequery.PdfSplitFilesInfo(
        fileId,
        mainPDFId,
        result.originalname,
        blobName,
        0,
        projectId,
        1,
        fileType
      );
    }

    try {
      const responses = await Promise.all(promises);
    } catch (error) {
      // res.status(500).json({ message: error });
    }
    
    
  }
}

function splitDocxIntoParts(text) {
  const estimatedWordsPerPart = 15000;
  const words = text.split(' ');

  const parts = [];
  let currentPart = '';

  for (const word of words) {
    if ((currentPart + word).length > estimatedWordsPerPart) {
      parts.push(currentPart);
      currentPart = '';
    }
    currentPart += (currentPart ? ' ' : '') + word;
  }

  if (currentPart) {
    parts.push(currentPart);
  }

  return parts;
}

async function searchCollection(id,verctorvalues,accessfiles) {

  let accessiblefiles=[]
  console.log(accessfiles,"accessfiles--------------->>>>>>>",accessfiles.length)
  if(accessfiles.length<=0)
  
  {
      console.log("eneterfffff")
   accessiblefiles.push( { key: "ProjectFileId", match: { value:"" } })
  }
  else{
  for(var i=0;i<accessfiles.length;i++)
  {
   accessiblefiles.push( { key: "ProjectFileId", match: { value:accessfiles[i] } })
  }
}
console.log(accessiblefiles,"accessiblefilesaccessiblefiles")

 var qdbdata=[]
    let data = JSON.stringify({
      filter: {
        should: accessiblefiles
    },
      vector:verctorvalues,
      limit: 3,
      with_vector: false,
        with_payload: true,
    });
 
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://qdrant-db.miraclesoft.com/collections/${id}/points/search`,
      headers: { 
        'Content-Type': 'application/json',
        'api-key':'df456722-ea64-4488-b97b-e8a58aa065eb'
      },
      data : data
    };
    
   await axios.request(config)
    .then((response) => {
           console.log(response.data,"from qudrant")
      qdbdata.push(response.data)
     
    })
    .catch((error) => {
      console.log(error);
    });
    return qdbdata[0]
}

async function downloadTextFile(  connectionString,
  containerName,
  blobName,projectId) {
  
  let blobsearch = blobName + ".txt";
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(projectId+"/"+blobsearch);

  const downloadResponse = await blockBlobClient.download(0);
  const downloadedContent = await streamToString(
    downloadResponse.readableStreamBody
  );
  function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", (data) => {
        chunks.push(data.toString());
      });
      readableStream.on("end", () => {
        resolve(chunks.join(""));
      });
      readableStream.on("error", reject);
    });
  }
  console.log("Downloaded file content:");
  return downloadedContent;
}
module.exports.downloadTextFile = downloadTextFile;

async function getChunkdataFromBlob(chunkname,projectFileid,projectId,connectionString,containerName)
{

  var blobContent = await downloadTextFile(
    connectionString,
    containerName,
    chunkname,projectId
  )

  // listOfChunks.push(blobContent);
  return  blobContent
  
}
async function deleteFolder(containerName, folderName, connectionString) {
 

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // List blobs in the container
  const iter = containerClient.listBlobsFlat({ prefix: folderName });

  for await (const blob of iter) {
    // Delete each blob
    await containerClient.deleteBlob(blob.name);
    console.log(`Deleted blob ${blob.name}`);
  }
}
module.exports.deleteFolder = deleteFolder;
module.exports.getChunkdataFromBlob = getChunkdataFromBlob;
module.exports.searchCollection = searchCollection;
module.exports.ProcessUploadedFile=ProcessUploadedFile
module.exports.generateNumberArray=generateNumberArray
module.exports.getfilesdata=getfilesdata
module.exports.embedding=embedding
module.exports.splitTraning=splitTraning
module.exports.generateNumbers=generateNumbers
module.exports.FileUrlChanger=FileUrlChanger