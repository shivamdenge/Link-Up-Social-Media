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
   * Get eligible registered users for network discovery: GET /api/v1/users/core/eligible
   */
  getEligibleUsers: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_ELIGIBLE_USERS);
    return response.data || [];
  },

  /**
   * Get user profile by ID: GET /api/v1/users/core/{userId}
   */
  getUserById: async (userId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_USER(userId));
    return response.data;
  },

  /**
   * Upload profile photo to GCS via user service: POST /api/v1/users/core/profile-photo
   */
  uploadProfilePhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(API_ENDPOINTS.UPLOAD_PROFILE_PHOTO, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

