import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from './config';

export const connectionApi = {
  /**
   * GET /api/v1/connections/core/{userId}/first-degree
   */
  getConnections: async (userId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_CONNECTIONS(userId));
    return response.data;
  },

  /**
   * POST /api/v1/connections/core/request/{userId}
   */
  sendRequest: async (userId) => {
    const response = await axiosInstance.post(API_ENDPOINTS.SEND_CONNECTION_REQUEST(userId));
    return response.data;
  },

  /**
   * POST /api/v1/connections/core/accept/{userId}
   */
  acceptRequest: async (senderId) => {
    const response = await axiosInstance.post(API_ENDPOINTS.ACCEPT_CONNECTION_REQUEST(senderId));
    return response.data;
  },

  /**
   * POST /api/v1/connections/core/reject/{userId}
   */
  rejectRequest: async (senderId) => {
    const response = await axiosInstance.post(API_ENDPOINTS.REJECT_CONNECTION_REQUEST(senderId));
    return response.data;
  },
};
