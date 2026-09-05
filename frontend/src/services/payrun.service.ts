import apiClient from './apiClient';
import {
  Payrun, Payslip, SalaryStructure, SalaryRule,
  ApiResponse, EligibleEmployee,
  DashboardMetrics, DepartmentCost, SalaryTrendPoint, DashboardAlert,
  Contract, WorkingSchedule, User
} from '../types';

export const payrunService = {
  // Payruns
  async listPayruns(): Promise<ApiResponse<Payrun[]>> {
    const { data } = await apiClient.get<ApiResponse<Payrun[]>>('/payruns');
    return data;
  },
  async getPayrun(id: string): Promise<ApiResponse<Payrun & { payslips: Payslip[] }>> {
    const { data } = await apiClient.get<ApiResponse<Payrun & { payslips: Payslip[] }>>(`/payruns/${id}`);
    return data;
  },
  async getEligibleEmployees(payload: { structureId: string; startDate: string; endDate: string }): Promise<ApiResponse<EligibleEmployee[]>> {
    const { data } = await apiClient.post<ApiResponse<EligibleEmployee[]>>('/payruns/eligible-employees', payload);
    return data;
  },
  async createPayrun(payload: { structureId: string; startDate: string; endDate: string; name: string; employeeIds: string[] }): Promise<ApiResponse<Payrun>> {
    const { data } = await apiClient.post<ApiResponse<Payrun>>('/payruns', payload);
    return data;
  },
  async computePayrun(id: string): Promise<ApiResponse<Payrun>> {
    const { data } = await apiClient.post<ApiResponse<Payrun>>(`/payruns/${id}/compute`);
    return data;
  },
  async validatePayrun(id: string): Promise<ApiResponse<Payrun>> {
    const { data } = await apiClient.post<ApiResponse<Payrun>>(`/payruns/${id}/validate`);
    return data;
  },
  async markPaid(id: string): Promise<ApiResponse<Payrun>> {
    const { data } = await apiClient.post<ApiResponse<Payrun>>(`/payruns/${id}/mark-paid`);
    return data;
  },
  async sendPayslips(id: string): Promise<ApiResponse<{ sent: number }>> {
    const { data } = await apiClient.post<ApiResponse<{ sent: number }>>(`/payruns/${id}/send-payslips`);
    return data;
  },

  // Payslips
  async listPayslips(params?: Record<string, string>): Promise<ApiResponse<Payslip[]>> {
    const { data } = await apiClient.get<ApiResponse<Payslip[]>>('/payslips', { params });
    return data;
  },
  async getPayslip(id: string): Promise<ApiResponse<Payslip>> {
    const { data } = await apiClient.get<ApiResponse<Payslip>>(`/payslips/${id}`);
    return data;
  },
  getPayslipPdfUrl(id: string): string {
    return `/api/v1/payslips/${id}/pdf`;
  },

  // Salary Structures
  async listStructures(): Promise<ApiResponse<SalaryStructure[]>> {
    const { data } = await apiClient.get<ApiResponse<SalaryStructure[]>>('/salary-structures');
    return data;
  },
  async getStructure(id: string): Promise<ApiResponse<SalaryStructure & { rules: SalaryRule[] }>> {
    const { data } = await apiClient.get<ApiResponse<SalaryStructure & { rules: SalaryRule[] }>>(`/salary-structures/${id}`);
    return data;
  },
  async createStructure(payload: Partial<SalaryStructure>): Promise<ApiResponse<SalaryStructure>> {
    const { data } = await apiClient.post<ApiResponse<SalaryStructure>>('/salary-structures', payload);
    return data;
  },
  async updateStructure(id: string, payload: Partial<SalaryStructure>): Promise<ApiResponse<SalaryStructure>> {
    const { data } = await apiClient.put<ApiResponse<SalaryStructure>>(`/salary-structures/${id}`, payload);
    return data;
  },

  // Salary Rules
  async listRules(params?: Record<string, string>): Promise<ApiResponse<SalaryRule[]>> {
    const { data } = await apiClient.get<ApiResponse<SalaryRule[]>>('/salary-rules', { params });
    return data;
  },
  async getRule(id: string): Promise<ApiResponse<SalaryRule>> {
    const { data } = await apiClient.get<ApiResponse<SalaryRule>>(`/salary-rules/${id}`);
    return data;
  },
  async createRule(payload: Partial<SalaryRule>): Promise<ApiResponse<SalaryRule>> {
    const { data } = await apiClient.post<ApiResponse<SalaryRule>>('/salary-rules', payload);
    return data;
  },
  async updateRule(id: string, payload: Partial<SalaryRule>): Promise<ApiResponse<SalaryRule>> {
    const { data } = await apiClient.put<ApiResponse<SalaryRule>>(`/salary-rules/${id}`, payload);
    return data;
  },

  // Dashboard
  async getDashboardMetrics(params?: Record<string, string>): Promise<ApiResponse<DashboardMetrics>> {
    const { data } = await apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics', { params });
    return data;
  },
  async getDepartmentCosts(params?: Record<string, string>): Promise<ApiResponse<DepartmentCost[]>> {
    const { data } = await apiClient.get<ApiResponse<DepartmentCost[]>>('/dashboard/department-costs', { params });
    return data;
  },
  async getSalaryTrend(params?: Record<string, string>): Promise<ApiResponse<SalaryTrendPoint[]>> {
    const { data } = await apiClient.get<ApiResponse<SalaryTrendPoint[]>>('/dashboard/salary-trend', { params });
    return data;
  },
  async getDashboardAlerts(): Promise<ApiResponse<DashboardAlert[]>> {
    const { data } = await apiClient.get<ApiResponse<DashboardAlert[]>>('/dashboard/alerts');
    return data;
  },

  // Contracts
  async listContracts(params?: Record<string, string>): Promise<ApiResponse<Contract[]>> {
    const { data } = await apiClient.get<ApiResponse<Contract[]>>('/contracts', { params });
    return data;
  },
  async getContract(id: string): Promise<ApiResponse<Contract>> {
    const { data } = await apiClient.get<ApiResponse<Contract>>(`/contracts/${id}`);
    return data;
  },
  async createContract(payload: Partial<Contract>): Promise<ApiResponse<Contract>> {
    const { data } = await apiClient.post<ApiResponse<Contract>>('/contracts', payload);
    return data;
  },
  async updateContract(id: string, payload: Partial<Contract>): Promise<ApiResponse<Contract>> {
    const { data } = await apiClient.put<ApiResponse<Contract>>(`/contracts/${id}`, payload);
    return data;
  },

  // Schedules
  async listSchedules(): Promise<ApiResponse<WorkingSchedule[]>> {
    const { data } = await apiClient.get<ApiResponse<WorkingSchedule[]>>('/schedules');
    return data;
  },
  async getSchedule(id: string): Promise<ApiResponse<WorkingSchedule>> {
    const { data } = await apiClient.get<ApiResponse<WorkingSchedule>>(`/schedules/${id}`);
    return data;
  },
  async createSchedule(payload: Partial<WorkingSchedule>): Promise<ApiResponse<WorkingSchedule>> {
    const { data } = await apiClient.post<ApiResponse<WorkingSchedule>>('/schedules', payload);
    return data;
  },
  async updateSchedule(id: string, payload: Partial<WorkingSchedule>): Promise<ApiResponse<WorkingSchedule>> {
    const { data } = await apiClient.put<ApiResponse<WorkingSchedule>>(`/schedules/${id}`, payload);
    return data;
  },

  // Users
  async listUsers(): Promise<ApiResponse<User[]>> {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/users');
    return data;
  },
  async createUser(payload: { name: string; email: string; password: string; role: string; employeeId?: string }): Promise<ApiResponse<User>> {
    const { data } = await apiClient.post<ApiResponse<User>>('/users', payload);
    return data;
  },
  async updateUser(id: string, payload: Partial<User>): Promise<ApiResponse<User>> {
    const { data } = await apiClient.put<ApiResponse<User>>(`/users/${id}`, payload);
    return data;
  },

  // Departments
  async listDepartments() {
    const { data } = await apiClient.get('/departments');
    return data;
  },
};
