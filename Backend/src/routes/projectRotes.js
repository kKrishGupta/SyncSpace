const express = require("express");

const projectController =
  require("../controllers/projectController");

const validate = require("../middleware/validate");

const {
  createProjectSchema,
  updateProjectSchema
} = require("../validations/projectValidation");

const router = express.Router();

router.get(
  "/workspaces/:id/projects",
  projectController.getProjectsByWorkspace
);

router.post(
  "/workspaces/:id/projects",
  validate(createProjectSchema),
  projectController.createProject
);

router.get(
  "/projects/:id",
  projectController.getProjectById
);

router.patch(
  "/projects/:id",
  validate(updateProjectSchema),
  projectController.updateProject
);

router.delete(
  "/projects/:id",
  projectController.deleteProject
);

module.exports = router;