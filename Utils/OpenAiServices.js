require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const key = process.env.key;
const headers = {
  "api-key": key,
  "Content-Type": "application/json",
};
const url = process.env.embedingsurl;

const axios=require('axios')
const {sessionHistorycheck}=require('../Utils/SqlQueries')
async function embedding(data) {
    
    var temp = [];
    const requestData = {
      input: data,
    };
    await axios
    .post(url, requestData, { 
      headers: headers,
      timeout: 500000 // Set the timeout value to 5000 milliseconds (5 seconds)
    })
    .then((response) => {

      temp.push(response.data.data[0].embedding);
    })
    .catch((error) => {
      console.log("error");
    });
    return temp;
  }
  async function azureopenai(matchedprompts, question, HubbleId, project,sessionId) {
    console.log("openaicall",matchedprompts)
    // console.log(matchedprompts,"matchedprompts")
  
    let systemPromptTemplate =project[0].systemPromptTemplate
    let queryPromptTemplate =project[0].queryPromptTemplate
    let systemPrompt = systemPromptTemplate
      .replace("[(CONTEXT)]", matchedprompts)
      .replace("[(QUERY)]", question)
      .replace("[(TONE)]", project[0].ResponseTone);
    var queryPrompt = queryPromptTemplate
      .replace("[(CONTEXT)]", matchedprompts)
      .replace("[(QUERY)]", question)
      .replace("[(TONE)]", project[0].ResponseTone);
      var sessionhistory=[];
  if(sessionId)
  {

       sessionhistory= await sessionHistorycheck(sessionId)
  }
  
  if(sessionhistory.length>0)
  {
    
  console.log(sessionhistory,"check")
    let dbarray=[]
    sessionhistory.map((item,index)=>
    {
     dbarray.push(
      {
        role: "user",
        content: item.Input,
      }
     
      )
      dbarray.push(
       {
          role: "assistant",
          content: item.Response,
        }
       
        )
  
    })
    var temp = {
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: queryPrompt,
        },
      ],
    };
  
    dbarray.unshift(temp.messages[0])
    dbarray.push(temp.messages[1])
    temp.messages=dbarray
   var data=JSON.stringify({
    messages:temp.messages})
  
  }
  else{
    console.log("elseEnter===")
    var data = JSON.stringify({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: queryPrompt,
        },
      ],
    });
  
    console.log(data,"check")
  }
  
  
  
    var config = {
      method: "post",
      url: process.env.queryurl,
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.key,
      },
      temperature: 0,
      data: data,
    };
    let resp;
    await axios(config)
      .then(async function (response) {
        resp = response.data.choices[0].message.content;
      })
      .catch(function (error) {
        console.log(error);
      });
    return resp;
  }


  module.exports.azureopenai = azureopenai;
  module.exports.embedding=embedding