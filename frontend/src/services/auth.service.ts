import apiClient from './apiClient';
import { AuthUser, ApiResponse } from '../types';

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    const { data } = await apiClient.post<ApiResponse<LoginResult>>('/auth/login', { email, password });
    return data.data;
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
    return data.data;
  },
};
