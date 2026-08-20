import apiClient from './apiClient';

export const activityService = {
  getWorkspaceActivity: async (workspaceId) => {
    return await apiClient(`/activities/workspace/${workspaceId}`);
  },

  getProjectActivity: async (projectId) => {
    return await apiClient(`/activities/project/${projectId}`);
  }
};
