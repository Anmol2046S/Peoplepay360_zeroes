// ============================================================
// PeoplePay360 / HRMS OXP - Frontend Type Definitions
// Mirrors backend Prisma schema & API response shapes
// ============================================================

// --- Enums ---
export type SystemRole = 'EMPLOYEE' | 'HR_MANAGER' | 'HR_PAYROLL_USER' | 'HR_PAYROLL_MANAGER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type ContractStatus = 'DRAFT' | 'RUNNING' | 'EXPIRED' | 'CANCELLED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'OVERTIME';
export type TimeOffUnit = 'DAYS' | 'HOURS';
export type TimeOffApprovalType = 'MANAGER' | 'OFFICER' | 'NO_VALIDATION';
export type TimeOffRequestStatus = 'DRAFT' | 'TO_APPROVE' | 'APPROVED' | 'REFUSED';
export type TimeOffAllocationStatus = 'DRAFT' | 'TO_APPROVE' | 'APPROVED' | 'REFUSED';
export type SalaryRuleCategory = 'BASIC' | 'ALLOWANCE' | 'GROSS' | 'DEDUCTION' | 'NET';
export type ComputationMethod = 'FIXED' | 'PERCENTAGE' | 'FORMULA';
export type PayrunStatus = 'DRAFT' | 'COMPUTED' | 'VALIDATED' | 'PAID';
export type PayslipStatus = 'DRAFT' | 'DONE' | 'CANCELLED';

// --- Auth ---
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: SystemRole;
  employeeId?: string | null;
  status: AccountStatus;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

// --- Department ---
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}

// --- User ---
export interface User {
  id: string;
  email: string;
  name: string;
  role: SystemRole;
  status: AccountStatus;
  createdAt: string;
  employeeId?: string | null;
  employee?: { firstName: string; lastName: string; employeeCode: string } | null;
}

// --- Employee ---
export interface SmartCounts {
  contracts: number;
  attendance: number;
  timeOff: number;
  allocations: number;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  workPhone?: string;
  jobPosition: string;
  status: AccountStatus;
  workLocation: string;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  createdAt: string;
  updatedAt: string;
  departmentId: string;
  department: Department;
  managerId?: string | null;
  manager?: { firstName: string; lastName: string } | null;
  workingScheduleId?: string | null;
  workingSchedule?: { name: string } | null;
  smartCounts?: SmartCounts;
}

// --- Working Schedule ---
export interface ScheduleDay {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  breakHours: number;
  workHours: number;
}

export interface WorkingSchedule {
  id: string;
  name: string;
  company: string;
  daysPerWeek: number;
  hoursPerWeek: number;
  timezone: string;
  status: AccountStatus;
  days: ScheduleDay[];
  createdAt: string;
}

// --- Contract ---
export interface Contract {
  id: string;
  contractReference: string;
  startDate: string;
  endDate?: string | null;
  monthlyWage: number;
  status: ContractStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  employeeId: string;
  employee?: { firstName: string; lastName: string; employeeCode: string };
  salaryStructureId?: string | null;
  salaryStructure?: { name: string; code: string } | null;
  workingScheduleId?: string | null;
  workingSchedule?: { name: string } | null;
  departmentId?: string | null;
  department?: { name: string } | null;
}

// --- Attendance ---
export interface Attendance {
  id: string;
  date: string;
  checkIn: string;
  checkOut?: string | null;
  workedHours: number;
  overtimeHours: number;
  status: AttendanceStatus;
  notes?: string;
  isManualEdit: boolean;
  employeeId: string;
  employee?: { firstName: string; lastName: string; employeeCode: string };
  createdAt: string;
}

// --- Time Off ---
export interface TimeOffType {
  id: string;
  name: string;
  unit: TimeOffUnit;
  requiresAllocation: boolean;
  approvalType: TimeOffApprovalType;
  displayColor: string;
  status: AccountStatus;
  createdAt: string;
}

export interface TimeOffAllocation {
  id: string;
  allocatedDays: number;
  takenDays: number;
  remainingDays: number;
  validityYear: number;
  description?: string;
  status: TimeOffAllocationStatus;
  employeeId: string;
  employee?: { firstName: string; lastName: string; employeeCode: string };
  timeOffTypeId: string;
  timeOffType: TimeOffType;
  createdAt: string;
}

export interface TimeOffRequest {
  id: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  reason?: string;
  status: TimeOffRequestStatus;
  approverName?: string;
  employeeId: string;
  employee?: { firstName: string; lastName: string; employeeCode: string };
  timeOffTypeId: string;
  timeOffType: TimeOffType;
  allocationId?: string | null;
  createdAt: string;
}

// --- Salary ---
export interface SalaryStructure {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: AccountStatus;
  createdAt: string;
  _count?: { rules: number; contracts: number };
}

export interface SalaryRule {
  id: string;
  name: string;
  code: string;
  category: SalaryRuleCategory;
  sequence: number;
  computationMethod: ComputationMethod;
  amount?: number | null;
  percentage?: number | null;
  percentageBase?: string | null;
  formula?: string | null;
  status: AccountStatus;
  salaryStructureId: string;
  salaryStructure?: { name: string; code: string };
  createdAt: string;
}

// --- Payrun ---
export interface Payrun {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PayrunStatus;
  totalGross: number;
  totalNet: number;
  warningsCount: number;
  salaryStructureId: string;
  salaryStructure?: { name: string; code: string };
  createdAt: string;
  _count?: { payslips: number };
}

// --- Payslip ---
export interface PayslipLine {
  id: string;
  code: string;
  name: string;
  category: SalaryRuleCategory;
  amount: number;
  sequence: number;
}

export interface Payslip {
  id: string;
  payslipNumber: string;
  startDate: string;
  endDate: string;
  workedDays: number;
  basicWage: number;
  grossWage: number;
  netWage: number;
  status: PayslipStatus;
  warningMessage?: string;
  pdfPath?: string;
  sentEmail: boolean;
  employeeId: string;
  employee?: { firstName: string; lastName: string; employeeCode: string; workEmail: string };
  contractId: string;
  payrunId: string;
  payrun?: { name: string; status: PayrunStatus };
  lines: PayslipLine[];
  createdAt: string;
}

// --- Dashboard ---
export interface DashboardMetrics {
  totalNetSalary: number;
  totalPayslips: number;
  avgSalary: number;
  totalTimeOffDays: number;
  attendanceHealthPercent: number;
  period: string;
}

export interface DepartmentCost {
  department: string;
  totalCost: number;
  headcount: number;
  avgSalary: number;
}

export interface SalaryTrendPoint {
  month: string;
  totalNet: number;
  avgNet: number;
  payslipCount: number;
}

export interface DashboardAlert {
  id: string;
  type: 'MISSING_BANK' | 'DUPLICATE_PAYSLIP' | 'EXPIRING_CONTRACT' | 'DRAFT_WARNING';
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  employeeCode?: string;
  employeeName?: string;
}

// --- API Standard Response ---
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

// --- Payrun Wizard ---
export interface EligibleEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  jobPosition: string;
  department: string;
  monthlyWage: number;
  contractId: string;
}
