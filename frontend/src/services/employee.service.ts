import apiClient from './apiClient';
import { Employee, ApiResponse } from '../types';

export const employeeService = {
  async list(params?: Record<string, string>): Promise<ApiResponse<Employee[]>> {
    const { data } = await apiClient.get<ApiResponse<Employee[]>>('/employees', { params });
    return data;
  },

  async get(id: string): Promise<ApiResponse<Employee>> {
    const { data } = await apiClient.get<ApiResponse<Employee>>(`/employees/${id}`);
    return data;
  },

  async create(payload: Partial<Employee>): Promise<ApiResponse<Employee>> {
    const { data } = await apiClient.post<ApiResponse<Employee>>('/employees', payload);
    return data;
  },

  async update(id: string, payload: Partial<Employee>): Promise<ApiResponse<Employee>> {
    const { data } = await apiClient.put<ApiResponse<Employee>>(`/employees/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/employees/${id}`);
    return data;
  },
};
