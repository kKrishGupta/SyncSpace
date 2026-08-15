import apiClient from "./apiClient";

const getProjectsByWorkspace = async (workspaceId) => {
  return await apiClient(
    `/workspaces/${workspaceId}/projects`
  );
};

const createProject = async (workspaceId, projectData) => {
  return await apiClient(
    `/workspaces/${workspaceId}/projects`,
    {
      method: "POST",
      body: JSON.stringify(projectData)
    }
  );
};

const getProjectById = async (projectId) => {
  return await apiClient(
    `/projects/${projectId}`
  );
};

const updateProject = async (projectId, projectData) => {
  return await apiClient(
    `/projects/${projectId}`,
    {
      method: "PATCH",
      body: JSON.stringify(projectData)
    }
  );
};

const deleteProject = async (projectId) => {
  return await apiClient(
    `/projects/${projectId}`,
    {
      method: "DELETE"
    }
  );
};

export {
  getProjectsByWorkspace,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
};