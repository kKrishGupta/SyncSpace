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
  },

  getProjectFiles: async (projectId) => {
    return await apiClient(`/files/project/${projectId}`);
  },

  getCodeRoomData: async (projectId) => {
    return await apiClient(`/files/coderoom/${projectId}`);
  },

  createFile: async (projectId, fileData) => {
    return await apiClient(`/files/project/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(fileData)
    });
  },

  updateFileContent: async (fileId, content) => {
    return await apiClient(`/files/${fileId}/content`, {
      method: 'PATCH',
      body: JSON.stringify({ content })
    });
  },

  deleteFile: async (fileId) => {
    return await apiClient(`/files/${fileId}`, {
      method: 'DELETE'
    });
  },

  // Code Comments
  getCodeComments: async (fileId) => {
    return await apiClient(`/files/${fileId}/code-comments`);
  },

  createCodeComment: async (commentData) => {
    return await apiClient('/code-comments', {
      method: 'POST',
      body: JSON.stringify(commentData)
    });
  },

  toggleCommentStatus: async (commentId) => {
    return await apiClient(`/code-comments/${commentId}/status`, {
      method: 'PATCH'
    });
  },

  // Code Reviews
  getProjectReviews: async (projectId) => {
    return await apiClient(`/projects/${projectId}/reviews`);
  },

  createCodeReview: async (projectId, reviewData) => {
    return await apiClient(`/projects/${projectId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  },

  updateReviewStatus: async (reviewId, status) => {
    return await apiClient(`/reviews/${reviewId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Blockers
  getProjectBlockers: async (projectId) => {
    return await apiClient(`/projects/${projectId}/blockers`);
  },

  createBlocker: async (projectId, blockerData) => {
    return await apiClient(`/projects/${projectId}/blockers`, {
      method: 'POST',
      body: JSON.stringify(blockerData)
    });
  },

  resolveBlocker: async (blockerId) => {
    return await apiClient(`/blockers/${blockerId}/resolve`, {
      method: 'PATCH'
    });
  },

  // Decisions
  getProjectDecisions: async (projectId) => {
    return await apiClient(`/projects/${projectId}/decisions`);
  },

  createDecision: async (projectId, decisionData) => {
    return await apiClient(`/projects/${projectId}/decisions`, {
      method: 'POST',
      body: JSON.stringify(decisionData)
    });
  },

  // Team Chat
  getProjectChatMessages: async (projectId) => {
    return await apiClient(`/projects/${projectId}/chat`);
  },

  sendChatMessage: async (projectId, chatData) => {
    return await apiClient(`/projects/${projectId}/chat`, {
      method: 'POST',
      body: JSON.stringify(chatData)
    });
  }
};
