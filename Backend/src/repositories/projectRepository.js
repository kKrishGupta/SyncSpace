const Project = require('../models/Project');

const createProject = async (projectData, session = null) => {
  if(session){
    const result = await Project.create([projectData], { session });
    return result[0];
  }
  return await Project.create(projectData);
}

const findProjectsByWorkspace = async (workspaceId) => {
  return await Project.find({ workspaceId }).sort({ createdAt: -1 });
};

const findProjectById = async (projectId) => {
  return await Project.findById(projectId);
};

const updateProject = async (projectId, updateData, session = null) => {
  return await Project.findByIdAndUpdate(
    projectId,
    updateData,
    {
      new: true,
      runValidators: true,
      ...(session && { session })
    }
  );
};

const deleteProject = async (projectId, session = null) => {
  return await Project.findByIdAndDelete(projectId, {
    ...(session && { session })
  });
};




module.exports = {
  createProject,
  findProjectsByWorkspace,
  findProjectById,
  updateProject,
  deleteProject
}
