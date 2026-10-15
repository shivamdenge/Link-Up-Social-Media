import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from './config';

export const postApi = {
  /**
   * POST /api/v1/posts/core (multipart/form-data)
   */
  createPost: async (content, file) => {
    const formData = new FormData();
    const postBlob = new Blob([JSON.stringify({ content })], { type: 'application/json' });
    formData.append('post', postBlob);
    if (file) formData.append('file', file);

    const response = await axiosInstance.post(API_ENDPOINTS.CREATE_POST, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * GET /api/v1/posts/core/{postId}
   */
  getPostById: async (postId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_POST(postId));
    return response.data;
  },

  /**
   * GET /api/v1/posts/core/users/{userId}/allPosts
   */
  getPostsByUser: async (userId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_USER_POSTS(userId));
    return response.data;
  },

  /**
   * POST /api/v1/posts/likes/{postId}
   */
  likePost: async (postId) => {
    const response = await axiosInstance.post(API_ENDPOINTS.LIKE_POST(postId));
    return response.data;
  },

  /**
   * DELETE /api/v1/posts/likes/{postId}
   */
  unlikePost: async (postId) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.UNLIKE_POST(postId));
    return response.data;
  },
};
