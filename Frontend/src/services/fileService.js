import apiClient from './apiClient';

export const fileService = {
  uploadFile: async (file, data) => {
    const formData = new FormData();
    formData.append('file', file);
    if (data.workspaceId) formData.append('workspaceId', data.workspaceId);
    if (data.projectId) formData.append('projectId', data.projectId);
    if (data.taskId) formData.append('taskId', data.taskId);

    return await apiClient('/files/upload', {
      method: 'POST',
      body: formData
    });
  },

  getFiles: async (query) => {
    const searchParams = new URLSearchParams(query);
    return await apiClient(`/files?${searchParams.toString()}`);
  }
};
