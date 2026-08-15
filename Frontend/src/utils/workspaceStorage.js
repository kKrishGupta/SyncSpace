const WORKSPACE_KEY = "syncspace_Workspace";

const getStoredWorkspaceId = () => {
  return localStorage.getItem(WORKSPACE_KEY);
};

const setStoredWorkspaceId = (workspaceId) => {
  localStorage.setItem(WORKSPACE_KEY, workspaceId);
};

const removeStoredWorkspaceId = () => {
  localStorage.removeItem(WORKSPACE_KEY);
};

export {
  getStoredWorkspaceId,
  setStoredWorkspaceId,
  removeStoredWorkspaceId,
};