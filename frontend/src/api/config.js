// Centralized API configuration
// Using relative URL so Vite dev proxy forwards to localhost:8080
// In production, set this to the actual API Gateway URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const API_ENDPOINTS = {
  // Auth (User Service)
  SIGNUP: `${API_BASE_URL}/api/v1/users/auth/signup`,
  LOGIN: `${API_BASE_URL}/api/v1/users/auth/login`,

  // Posts Service
  POSTS_BASE: `${API_BASE_URL}/api/v1/posts`,
  CREATE_POST: `${API_BASE_URL}/api/v1/posts/core`,
  GET_POST: (postId) => `${API_BASE_URL}/api/v1/posts/core/${postId}`,
  GET_USER_POSTS: (userId) => `${API_BASE_URL}/api/v1/posts/core/users/${userId}/allPosts`,
  LIKE_POST: (postId) => `${API_BASE_URL}/api/v1/posts/likes/${postId}`,
  UNLIKE_POST: (postId) => `${API_BASE_URL}/api/v1/posts/likes/${postId}`,

  // Connections Service
  GET_CONNECTIONS: (userId) => `${API_BASE_URL}/api/v1/connections/core/${userId}/first-degree`,
  SEND_CONNECTION_REQUEST: (userId) => `${API_BASE_URL}/api/v1/connections/core/request/${userId}`,
  ACCEPT_CONNECTION_REQUEST: (userId) => `${API_BASE_URL}/api/v1/connections/core/accept/${userId}`,
  REJECT_CONNECTION_REQUEST: (userId) => `${API_BASE_URL}/api/v1/connections/core/reject/${userId}`,
};

export default API_BASE_URL;
