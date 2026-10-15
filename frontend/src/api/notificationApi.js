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
};
