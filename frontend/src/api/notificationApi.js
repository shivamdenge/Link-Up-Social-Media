import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from './config';

export const notificationApi = {
  /**
   * GET /api/v1/notifications/core
   */
  getNotifications: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_NOTIFICATIONS);
    return response.data || [];
  },

  /**
   * GET /api/v1/notifications/core/unread-count
   */
  getUnreadCount: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_UNREAD_NOTIFICATION_COUNT);
    return response.data?.count || 0;
  },

  /**
   * PUT /api/v1/notifications/core/{id}/read
   */
  markAsRead: async (id) => {
    const response = await axiosInstance.put(API_ENDPOINTS.MARK_NOTIFICATION_READ(id));
    return response.data;
  },

  /**
   * PUT /api/v1/notifications/core/read-all
   */
  markAllAsRead: async () => {
    const response = await axiosInstance.put(API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ);
    return response.data;
  },
};

