import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from './config';

export const authApi = {
  /**
   * POST /api/v1/users/auth/signup
   */
  signup: async ({ name, email, password }) => {
    const response = await axiosInstance.post(API_ENDPOINTS.SIGNUP, { name, email, password });
    return response.data;
  },

  /**
   * POST /api/v1/users/auth/login
   */
  login: async ({ email, password }) => {
    const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },
};
