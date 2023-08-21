const {
  addProjects,
  getProjects,
  getProjectsById,
  modifyProject,
  deleteProject,
} = require("../Controllers/Project.Controllers");
const {
  getFiles,
  deleteFile,
  uploadFiles,
  restrictFileAccess,
} = require("../Controllers/Files.Controllers");
const { query } = require("../Controllers/Query.Controllers");
const {
  train,
  trainingStatus,
  resetTraining,
} = require("../Controllers/Train.Controllers");

const {
  allowedusers,
  deleteallowedusers,
  addallowedusers,
  Chatusers,
} = require("../Controllers/Users.Controllers");
const {SessionsId}=require('../Controllers/Sessions.Controllers')
module.exports = (app) => {
  app.route("/projects").get(getProjects);
  app.route("/projects").post(addProjects);
  app.route("/projects/:id").get(getProjectsById);
  app.route("/projects/:projectId/files").get(getFiles);
  app.route("/projects/:projectId/files/upload").post(uploadFiles);
  app.route("/projects/:projectId/train").post(train);
  app.route("/projects/:id/query").post(query);
  app.route("/projects/:projectId/files/:fileId").delete(deleteFile);
  app.route("/projects/:projectId").delete(deleteProject);
  app.route("/projects/:id/TrainingStatus").get(trainingStatus);
  app.route("/projects/:id/ResetTraining").post(resetTraining);
  app.route("/projects/:projectId").put(modifyProject);
  app.route("/chatusers").post(Chatusers);
  app
    .route("/projects/:projectId/files/:fileId/SetPrivate")
    .put(restrictFileAccess);
  app
    .route("/projects/:projectId/files/:fileId/AllowedUsers")
    .post(addallowedusers);
  app
    .route("/projects/:projectId/files/:fileId/AllowedUsers")
    .get(allowedusers);
  app
    .route("/projects/:projectId/files/:fileId/AllowedUsers")
    .delete(deleteallowedusers);
    app
    .route("/sessions")
    .post(SessionsId);
  // app.route(basePath+suggestedpromptss).post(suggestedprompts);
};
