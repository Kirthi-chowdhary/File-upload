const axios=require('axios')
const { v4: uuidv4 } = require("uuid");
async function createCollection(id) {
    let data = JSON.stringify({
      vectors: {
        size: 1536,
        distance: "Cosine",
        on_disk: true,
      },
      optimizers_config: {
        default_segment_number: 2,
      },
      replication_factor: 2,
    });
  
    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${process.env.qdranturl}/collections/${id}`,
  
      headers: {
        "Content-Type": "application/json",
        "api-key":process.env.qdrantdbkey,
      },
      data: data,
    };
  
    axios
      .request(config)
      .then((response) => {
        console.log("collection created");
      })
      .catch((error) => {
        console.log(error);
      });
  }
  async function deletecollection(id) {

    let config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `${process.env.qdranturl}/collections/${id}`,
      headers: {
        "Content-Type": "application/json",
        "api-key":process.env.qdrantdbkey,
      },
    };
  
    axios
      .request(config)
      .then((response) => {
        console.log("collection deleted")
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  }
  async function searchCollection(id,verctorvalues,accessfiles) {

    let accessiblefiles=[]
    if(accessfiles.length<=0)
    {
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
        url: `${process.env.qdranturl}/collections/${id}/points/search`,
        headers: { 
          'Content-Type': 'application/json',
          'api-key':process.env.qdrantdbkey
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
  async function deleteCollectionById(projectId,id) {

    console.log(id,"delete")
    let data = JSON.stringify({
      
        filter: {
            must: [
                {
                    key: "ProjectFileId",
                    match: {
                        value:id
                    }
                }
            ]
        }
    });
    
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${process.env.qdranturl}/collections/${projectId}/points/delete`,
      headers: { 
        'Content-Type': 'application/json',
        'api-key':process.env.qdrantdbkey
      },
      data : data
    };
    
   await axios.request(config)
    .then((response) => {
console.log(response)
     
    })
    .catch((error) => {
      console.log(error);
    });

}
async function deleteCollectionByProjectId(id) {

  console.log(id,"delete")
  let data = JSON.stringify({
    
      filter: {
          must: [
              {
                  key: "projectId",
                  match: {
                      value:id
                  }
              }
          ]
      }
  });
  
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${process.env.qdranturl}/collections/${id}/points/delete`,
    headers: { 
      'Content-Type': 'application/json',
      'api-key':process.env.qdrantdbkey
    },
    data : data
  };
  
 await axios.request(config)
  .then((response) => {
console.log(response)
   
  })
  .catch((error) => {
    console.log(error);
  });

}
async function upsertPoints(vectorvalues, projectId, ChunkId, pageNumber,ProjectFileId) {
  console.log("upsertcall")
   const collectionName = projectId;
   const embeddingid = uuidv4();
   const points = {
     points: [
       {
         id: embeddingid,
         vector: vectorvalues,
         payload: {
           projectId: projectId,
           ChunkId: ChunkId,
           pageNumber: pageNumber,
           ProjectFileId:ProjectFileId
         },
       },
     ],
   };
   let config = {
     method: "put",
     maxBodyLength: Infinity,
   url: `${process.env.qdranturl}/collections/${projectId}/points?wait=true`,
    headers: { 
      'Content-Type': 'application/json',
      'api-key':process.env.qdrantdbkey
    },
     data: points,
   };
   
   await axios
     .request(config)
     .then(async(response) => {
      
       console.log("Points upserted");
    
     })
     .catch((error) => {
       console.log(error);
     });
 }
 module.exports.upsertPoints = upsertPoints;
module.exports.deleteCollectionByProjectId = deleteCollectionByProjectId;
module.exports.deleteCollectionById = deleteCollectionById;
module.exports.searchCollection = searchCollection;
  module.exports.createCollection=createCollection
  module.exports.deletecollection=deletecollection