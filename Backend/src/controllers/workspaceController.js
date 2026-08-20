const workspaceService = require('../services/workspaceService');
const logger = require('../utils/logger');
const User = require('../models/User');
const WorkspaceMember = require('../models/WorkspaceMember.model.js');
const notificationService = require('../services/notificationService');

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

const inviteMember = async (req, res, next) => {
  try {
    const { id: workspaceId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }

    // Verify caller is part of workspace (preferably owner/admin, but we'll check basic access first)
    const workspace = await workspaceService.getWorkspaceById(workspaceId, req.user.id);
    if (!workspace) {
      return res.status(404).json({ status: 'error', message: 'Workspace not found' });
    }

    const userToInvite = await User.findOne({ email: email.toLowerCase() });
    if (!userToInvite) {
      return res.status(404).json({ status: 'error', message: 'User not found with this email' });
    }

    // Check if already a member
    const existingMembership = await WorkspaceMember.findOne({
      workspaceId,
      userId: userToInvite._id,
      status: 'ACTIVE'
    });

    if (existingMembership) {
      return res.status(400).json({ status: 'error', message: 'User is already a member of this workspace' });
    }

    const newMember = await WorkspaceMember.create({
      workspaceId,
      userId: userToInvite._id,
      role: 'MEMBER'
    });

    // Notify the user
    await notificationService.createNotification({
      recipientId: userToInvite._id,
      actorId: req.user.id,
      type: 'WORKSPACE_INVITE',
      entityId: workspaceId,
      entityType: 'Workspace',
      message: `invited you to the workspace ${workspace.name}`
    });

    return res.status(200).json({
      success: true,
      message: 'Member invited successfully',
      data: newMember
    });

  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const { id: workspaceId } = req.params;

    // Verify caller is part of workspace
    await workspaceService.getWorkspaceById(workspaceId, req.user.id);

    const members = await WorkspaceMember.find({ workspaceId, status: 'ACTIVE' })
      .populate('userId', 'name email avatar')
      .lean();

    return res.status(200).json({
      success: true,
      data: members
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  inviteMember,
  getMembers
};