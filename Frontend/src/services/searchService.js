import apiClient from './apiClient';

export const searchService = {
  globalSearch: async (q, workspaceId) => {
    const searchParams = new URLSearchParams({ q });
    if (workspaceId) searchParams.append('workspaceId', workspaceId);
    return await apiClient(`/search?${searchParams.toString()}`);
  }
};
