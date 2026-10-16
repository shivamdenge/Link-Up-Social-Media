// Centralized API configuration
// Using relative URL so Vite dev proxy forwards to localhost:8080
// In production, set this to the actual API Gateway URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const API_ENDPOINTS = {
  // Auth (User Service)
  SIGNUP: `${API_BASE_URL}/api/v1/users/auth/signup`,
  LOGIN: `${API_BASE_URL}/api/v1/users/auth/login`,

  // Users Service
  SEARCH_USERS: (query) => query ? `${API_BASE_URL}/api/v1/users/core/search?query=${encodeURIComponent(query)}` : `${API_BASE_URL}/api/v1/users/core/search`,
  GET_ELIGIBLE_USERS: `${API_BASE_URL}/api/v1/users/core/eligible`,
  GET_USER: (userId) => `${API_BASE_URL}/api/v1/users/core/${userId}`,
  UPLOAD_PROFILE_PHOTO: `${API_BASE_URL}/api/v1/users/core/profile-photo`,

  // Posts Service
  POSTS_BASE: `${API_BASE_URL}/api/v1/posts`,
  CREATE_POST: `${API_BASE_URL}/api/v1/posts/core`,
  GET_FEED: `${API_BASE_URL}/api/v1/posts/core/feed`,
  GET_POST: (postId) => `${API_BASE_URL}/api/v1/posts/core/${postId}`,
  GET_USER_POSTS: (userId) => `${API_BASE_URL}/api/v1/posts/core/users/${userId}/allPosts`,
  DELETE_POST: (postId) => `${API_BASE_URL}/api/v1/posts/core/${postId}`,
  LIKE_POST: (postId) => `${API_BASE_URL}/api/v1/posts/likes/${postId}`,
  UNLIKE_POST: (postId) => `${API_BASE_URL}/api/v1/posts/likes/${postId}`,

  // Connections Service
  GET_CONNECTIONS: (userId) => `${API_BASE_URL}/api/v1/connections/core/${userId}/first-degree`,
  GET_RECEIVED_REQUESTS: `${API_BASE_URL}/api/v1/connections/core/requests/received`,
  GET_SENT_REQUESTS: `${API_BASE_URL}/api/v1/connections/core/requests/sent`,
  GET_CONNECTION_STATUS: (userId) => `${API_BASE_URL}/api/v1/connections/core/status/${userId}`,
  GET_BATCH_CONNECTION_STATUS: `${API_BASE_URL}/api/v1/connections/core/status/batch`,
  SEND_CONNECTION_REQUEST: (userId) => `${API_BASE_URL}/api/v1/connections/core/request/${userId}`,
  ACCEPT_CONNECTION_REQUEST: (userId) => `${API_BASE_URL}/api/v1/connections/core/accept/${userId}`,
  REJECT_CONNECTION_REQUEST: (userId) => `${API_BASE_URL}/api/v1/connections/core/reject/${userId}`,

  // Notification Service
  GET_NOTIFICATIONS: `${API_BASE_URL}/api/v1/notifications/core`,
  GET_UNREAD_NOTIFICATION_COUNT: `${API_BASE_URL}/api/v1/notifications/core/unread-count`,
  MARK_NOTIFICATION_READ: (id) => `${API_BASE_URL}/api/v1/notifications/core/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: `${API_BASE_URL}/api/v1/notifications/core/read-all`,
};

export default API_BASE_URL;
