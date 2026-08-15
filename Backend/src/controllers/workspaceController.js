const workspaceService = require('../services/workspaceService');
const logger = require('../utils/logger');

const createWorkspace = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const workspace = await workspaceService.createWorkspace({
      name,
      description,
      userId: req.user.id
    });

    return res.status(201).json({
      success: true,
      data: {
        id: workspace._id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description
      }
    });

  } catch (error) {
    logger.error(
      {
        err: error,
        userId: req.user?.id,
        body: req.body
      },
      "Error creating workspace"
    );

    next(error);
  }
};

const getWorkspaces = async (req, res,next) => {
  try{
    const workspaces = await workspaceService.getWorkspacesForUser(req.user.id);
    return res.status(200).json({
      success: true,
      data: workspaces
    });
  }catch(error){
    next(error);
  }
}

const getWorkspace = async (req, res,next) => {
  try{
    const workspace = await workspaceService.getWorkspaceById(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      data: workspace
    });
  }
  catch(error){
    next(error);
  }
}

const updateWorkspace = async (req, res,next) => {
  try{
    const workspace = await workspaceService.updateWorkspace(req.params.id, 
      req.user.id, 
      req.body);

    return res.status(200).json({
      success: true,
      data: workspace
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace
};