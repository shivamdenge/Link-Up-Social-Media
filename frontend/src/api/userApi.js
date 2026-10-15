import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from './config';

export const userApi = {
  /**
   * Search users by name: GET /api/v1/users/core/search?query=...
   */
  searchUsers: async (query) => {
    if (!query || !query.trim()) return [];
    const response = await axiosInstance.get(API_ENDPOINTS.SEARCH_USERS(query));
    return response.data;
  },

  /**
   * Get user profile by ID: GET /api/v1/users/core/{userId}
   */
  getUserById: async (userId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_USER(userId));
    return response.data;
  },
};
