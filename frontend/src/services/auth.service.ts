import apiClient from './apiClient';
import type { AuthUser, ApiResponse } from '../types';

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    const { data } = await apiClient.post<ApiResponse<LoginResult>>('/auth/login', { email, password });
    return data.data;
  },

  async devToken(role: string): Promise<LoginResult> {
    const { data } = await apiClient.get<LoginResult>(`/dev/token?role=${role}`);
    return data;
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
    return data.data;
  },
};
