import apiClient from './apiClient';

export const notificationService = {
  getNotifications: async () => {
    return await apiClient('/notifications');
  },

  markAsRead: async (id) => {
    return await apiClient(`/notifications/${id}/read`, { method: 'PUT' });
  },

  markAllAsRead: async () => {
    return await apiClient('/notifications/read-all', { method: 'PUT' });
  }
};
