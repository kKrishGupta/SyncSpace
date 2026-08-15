import apiClient from "./apiClient";

const getWorkspaces = async () => {
  return await apiClient("/workspaces");
};

const getWorkspaceById = async (workspaceId) => {
  return await apiClient(`/workspaces/${workspaceId}`);
};

const createWorkspace = async (workspaceData) => {
  return await apiClient("/workspaces", {
    method: "POST",
    body: JSON.stringify(workspaceData),
  });
};

const updateWorkspace = async (workspaceId, workspaceData) => {
  return await apiClient(`/workspaces/${workspaceId}`, {
    method: "PATCH",
    body: JSON.stringify(workspaceData),
  });
};

export {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
};