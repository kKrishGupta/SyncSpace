const Workspace = require("../models/Workspace");

const createWorkspace = async (workspaceData, session = null) => {
  if (session) {
    const result = await Workspace.create([workspaceData], { session });
    return result[0];
  }

  return await Workspace.create(workspaceData);
};

const findWorkspaceById = async (workspaceId) => {
  return await Workspace.findById(workspaceId);
};

const findWorkspacesByUser = async (userId) => {
  return await Workspace.find({
    ownerId: userId
  }).sort({ createdAt: -1 });
};

const updateWorkspace = async (
  workspaceId,
  updateData,
  session = null
) => {
  return await Workspace.findByIdAndUpdate(
    workspaceId,
    updateData,
    {
      new: true,
      runValidators: true,
      ...(session && { session })
    }
  );
};

module.exports = {
  createWorkspace,
  findWorkspaceById,
  findWorkspacesByUser,
  updateWorkspace
};