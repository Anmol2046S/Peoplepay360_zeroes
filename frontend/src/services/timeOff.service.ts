import apiClient from './apiClient';
import {
  TimeOffType, TimeOffRequest, TimeOffAllocation, ApiResponse
} from '../types';

export const timeOffService = {
  // Types
  async listTypes(): Promise<ApiResponse<TimeOffType[]>> {
    const { data } = await apiClient.get<ApiResponse<TimeOffType[]>>('/time-off/types');
    return data;
  },
  async getType(id: string): Promise<ApiResponse<TimeOffType>> {
    const { data } = await apiClient.get<ApiResponse<TimeOffType>>(`/time-off/types/${id}`);
    return data;
  },
  async createType(payload: Partial<TimeOffType>): Promise<ApiResponse<TimeOffType>> {
    const { data } = await apiClient.post<ApiResponse<TimeOffType>>('/time-off/types', payload);
    return data;
  },
  async updateType(id: string, payload: Partial<TimeOffType>): Promise<ApiResponse<TimeOffType>> {
    const { data } = await apiClient.put<ApiResponse<TimeOffType>>(`/time-off/types/${id}`, payload);
    return data;
  },

  // Requests
  async listRequests(params?: Record<string, string>): Promise<ApiResponse<TimeOffRequest[]>> {
    const { data } = await apiClient.get<ApiResponse<TimeOffRequest[]>>('/time-off/requests', { params });
    return data;
  },
  async getRequest(id: string): Promise<ApiResponse<TimeOffRequest>> {
    const { data } = await apiClient.get<ApiResponse<TimeOffRequest>>(`/time-off/requests/${id}`);
    return data;
  },
  async createRequest(payload: Partial<TimeOffRequest>): Promise<ApiResponse<TimeOffRequest>> {
    const { data } = await apiClient.post<ApiResponse<TimeOffRequest>>('/time-off/requests', payload);
    return data;
  },
  async approveRequest(id: string): Promise<ApiResponse<TimeOffRequest>> {
    const { data } = await apiClient.put<ApiResponse<TimeOffRequest>>(`/time-off/requests/${id}/approve`);
    return data;
  },
  async refuseRequest(id: string, reason?: string): Promise<ApiResponse<TimeOffRequest>> {
    const { data } = await apiClient.put<ApiResponse<TimeOffRequest>>(`/time-off/requests/${id}/refuse`, { reason });
    return data;
  },

  // Allocations
  async listAllocations(params?: Record<string, string>): Promise<ApiResponse<TimeOffAllocation[]>> {
    const { data } = await apiClient.get<ApiResponse<TimeOffAllocation[]>>('/time-off/allocations', { params });
    return data;
  },
  async getAllocation(id: string): Promise<ApiResponse<TimeOffAllocation>> {
    const { data } = await apiClient.get<ApiResponse<TimeOffAllocation>>(`/time-off/allocations/${id}`);
    return data;
  },
  async createAllocation(payload: Partial<TimeOffAllocation>): Promise<ApiResponse<TimeOffAllocation>> {
    const { data } = await apiClient.post<ApiResponse<TimeOffAllocation>>('/time-off/allocations', payload);
    return data;
  },
  async updateAllocation(id: string, payload: Partial<TimeOffAllocation>): Promise<ApiResponse<TimeOffAllocation>> {
    const { data } = await apiClient.put<ApiResponse<TimeOffAllocation>>(`/time-off/allocations/${id}`, payload);
    return data;
  },
};
