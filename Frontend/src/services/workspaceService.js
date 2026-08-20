import apiClient from "./apiClient";

export const createWorkspace = async (workspaceData) => {
  const response = await apiClient("/workspaces", {
    method: "POST",
    body: JSON.stringify(workspaceData),
  });
  return response;
};

export const getWorkspaces = async () => {
  const response = await apiClient("/workspaces", {
    method: "GET",
  });
  return response;
};

export const getWorkspaceById = async (id) => {
  const response = await apiClient(`/workspaces/${id}`, {
    method: "GET",
  });
  return response;
};

export const updateWorkspace = async (id, updateData) => {
  const response = await apiClient(`/workspaces/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });
  return response;
};

export const getWorkspaceMembers = async (id) => {
  const response = await apiClient(`/workspaces/${id}/members`, {
    method: "GET",
  });
  return response;
};

export const inviteMember = async (id, email) => {
  const response = await apiClient(`/workspaces/${id}/members/invite`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return response;
};