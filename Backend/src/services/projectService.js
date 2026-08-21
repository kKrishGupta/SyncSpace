const mongoose = require("mongoose");

const projectRepository = require("../repositories/projectRepository");
const workspaceMemberRepository = require("../repositories/workspaceMemberRepository");
const { hasPermission } = require("../websocket/workspaceAuthorization");

const createProject = async ({ workspaceId, name, key, description, userId }) => {

  if(!mongoose.Types.ObjectId.isValid(workspaceId)){
    const error = new Error("Invalid workspace ID");
    error.statusCode = 400;
    throw error;
  }

  if(!name || !name.trim()){
    const error = new Error("Project name is required");
    error.statusCode = 400;
    throw error;
  }

  if(!key || !key.trim()){
    const error = new Error("Project key is required");
    error.statusCode = 400;
    throw error;
  }

  const membership = await workspaceMemberRepository.findMembership(workspaceId, userId);
  if(!membership){
    const error = new Error("You do not have access to this workspace");
    error.statusCode = 403;
    throw error;
  }

  if (!hasPermission(membership.role, 'project.create')) {
    const error = new Error("You do not have permission to create projects");
    error.statusCode = 403;
    throw error;
  }

  try {
    return await projectRepository.createProject({
      workspaceId,
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description?.trim() || "",
      ownerId: userId,
      status: "ACTIVE"
    });
  } catch (error) {
    // Duplicate workspace + project key
    if (error.code === 11000) {
      const duplicateError = new Error(
        "Project key already exists in this workspace"
      );

      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
};

const getProjectsByWorkspace = async (workspaceId,userId) => {
  if(!mongoose.Types.ObjectId.isValid(workspaceId)){
    const error = new Error("Invalid workspace ID");
    error.statusCode = 400;
    throw error;
  }

  const membership = await workspaceMemberRepository.findMembership(workspaceId, userId);
  if(!membership){
    const error = new Error("You do not have access to this workspace");
    error.statusCode = 403;
    throw error;
  }
  
  if (!hasPermission(membership.role, 'project.read')) {
    const error = new Error("You do not have permission to read projects");
    error.statusCode = 403;
    throw error;
  }

  return await projectRepository.findProjectsByWorkspace(workspaceId);
}

const getProjectById = async (projectId,userId) => {
  if(!mongoose.Types.ObjectId.isValid(projectId)){
    const error = new Error("Invalid project ID");
    error.statusCode = 400;
    throw error;
  }

  const project = await projectRepository.findProjectById(projectId);
  if(!project){
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await workspaceMemberRepository.findMembership(project.workspaceId, userId);
  if(!membership){
    const error = new Error("You do not have access to this project");
    error.statusCode = 403;
    throw error;
  }

  if (!hasPermission(membership.role, 'project.read')) {
    const error = new Error("You do not have permission to read projects");
    error.statusCode = 403;
    throw error;
  }

  return project;
};

// update project details
const updateProject = async (projectId,updateData,userId) => {
  if(!mongoose.Types.ObjectId.isValid(projectId)){
    const error = new Error("Invalid project ID");
    error.statusCode = 400;
    throw error;
  }

  const project = await projectRepository.findProjectById(projectId);

  if(!project){
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await workspaceMemberRepository.findMembership(project.workspaceId, userId);
  if(!membership){
    const error = new Error("You do not have access to this project");
    error.statusCode = 403;
    throw error;
  }

  if(!hasPermission(membership.role, 'project.update')){
    const error = new Error("You do not have permission to update this project");
    error.statusCode = 403;
    throw error;
  }
  
  const allowedUpdates = {};
  if (updateData.name !== undefined) {
    if (!updateData.name.trim()) {
      const error = new Error(
        "Project name cannot be empty"
      );
      error.statusCode = 400;
      throw error;
    }

    allowedUpdates.name = updateData.name.trim();
  }

  if(updateData.description !== undefined){
    allowedUpdates.description = updateData.description.trim();
  }

  if(updateData.status !== undefined){
    if(!["ACTIVE","INACTIVE"].includes(updateData.status)){
      const error = new Error("Invalid project status");
      error.statusCode = 400;
      throw error;
    }
    allowedUpdates.status = updateData.status;
  }

  return await projectRepository.updateProject(projectId,allowedUpdates);
}

const deleteProject = async (projectId,userId) => {
  if(!mongoose.Types.ObjectId.isValid(projectId)){
    const error = new Error("Invalid project ID");
    error.statusCode = 400;
    throw error;
  }

  const project = await projectRepository.findProjectById(projectId);

  if(!project){
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const membership = await workspaceMemberRepository.findMembership(project.workspaceId, userId);
  if(!membership){
    const error = new Error("You do not have access to this project");
    error.statusCode = 403;
    throw error;
  }

  if(!hasPermission(membership.role, 'project.delete')){
    const error = new Error("You do not have permission to delete this project");
    error.statusCode = 403;
    throw error;
  }

  await projectRepository.deleteProject(projectId);
  return { 
    id: projectId,
    name: project.name,
    description: project.description,
    message: "Project deleted successfully" 
  };
};

module.exports = {
  createProject,
  getProjectsByWorkspace,
  getProjectById,
  updateProject,
  deleteProject
};

