require("dotenv").config();
const {
    AzureKeyCredential,
    DocumentAnalysisClient,
  } = require("@azure/ai-form-recognizer");
  
async function readFile(id) {
    const endpoint =
    process.env.formrecognizer
    const key1 = process.env.key1
    const formUrl =id
    console.log(formUrl,"yuvas")
    
   const client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(key1)
    );
    const poller = await client.beginAnalyzeDocument("prebuilt-read", formUrl);
    const fileContent = {};
   await poller.pollUntilDone()
    const { content, pages, languages, styles } = await poller.pollUntilDone();
  
    var text = [];

    if (pages.length <= 0) {
      
    } else {
     
      for (const page of pages) {
      
        var pageno = page.pageNumber;
        var pagecontent = "";
  
  
        if (page.lines.length > 0) {
        
  
          for (const line of page.lines) {
          
            pagecontent = pagecontent + line.content;
            text.push(line.content);
          }
        }
        fileContent[pageno] = pagecontent;
      }
    }
  
   
    return fileContent;
  }
  module.exports.readFile=readFile