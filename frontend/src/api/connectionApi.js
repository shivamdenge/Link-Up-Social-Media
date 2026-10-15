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
   * GET /api/v1/connections/core/requests/received
   */
  getReceivedRequests: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_RECEIVED_REQUESTS);
    return response.data;
  },

  /**
   * GET /api/v1/connections/core/requests/sent
   */
  getSentRequests: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_SENT_REQUESTS);
    return response.data;
  },

  /**
   * GET /api/v1/connections/core/status/{userId}
   */
  getStatus: async (userId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_CONNECTION_STATUS(userId));
    return response.data?.status;
  },

  /**
   * POST /api/v1/connections/core/status/batch
   */
  getBatchStatus: async (userIds) => {
    if (!userIds || userIds.length === 0) return {};
    const response = await axiosInstance.post(API_ENDPOINTS.GET_BATCH_CONNECTION_STATUS, userIds);
    return response.data || {};
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
