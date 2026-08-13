const projectService = require('../services/projectService');
const logger = require('../utils/logger');

// POST /api/v1/workspaces/:id/projects
const createProject = async (req, res,next) => {
  try{
    const{name,key,description} = req.body;
    const project = await projectService.createProject({
      workspaceId: req.params.id,
      name,
      key,
      description,
      userId: req.user.idcr
    });
    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: {
        id: project._id,
        name: project.name,
        key: project.key,
        description: project.description,
      }
    });
  } catch (error) {
    logger.error("Error creating project:", error);
    next(error);
  }
};

// GET /api/v1/workspaces/:id/projects
const getProjectsByWorkspace = async (req, res,next) => {
  try{
    const projects = await projectService.getProjectsByWorkspace(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Projects retrieved successfully",
      data: projects
    });
  } catch (error) {
    logger.error("Error fetching projects:", error);
    next(error);
  }
};

// GET /api/v1/projects/:id
const getProjectById = async (req, res,next) => {
  try{
    const project = await projectService.getProjectById(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Project retrieved successfully",
      data: project
    });
  } catch (error) {
    logger.error("Error fetching project:", error);
    next(error);
  }
}

// pATCH /api/v1/projects/:id

const updateProject = async (req, res,next) => {
  try{
    const project = await projectService.updateProject(req.params.id, req.body, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project
    });
  } catch (error) {
    logger.error("Error updating project:", error);
    next(error);
  }
}

// DELETE /api/v1/projects/:id
const deleteProject = async (req, res,next) => {
  try{
    const result = await projectService.deleteProject(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        id: result.id,
        name: result.name,
        description: result.description
      }
    });
    } catch (error) {
    logger.error("Error deleting project:", error);
    next(error);
  }
}

module.exports = {
  createProject,
  getProjectsByWorkspace,
  getProjectById,
  updateProject,
  deleteProject
};