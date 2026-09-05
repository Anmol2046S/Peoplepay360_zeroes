// ============================================================
// PeoplePay360 / HRMS OXP - Frontend Type Definitions
// Mirrors backend Prisma schema & API response shapes
// ============================================================

// --- Enums ---
export type SystemRole = 'SUPER_ADMIN' | 'HR_MANAGER' | 'HR_PAYROLL_USER' | 'HR_PAYROLL_MANAGER' | 'DEPARTMENT_MANAGER' | 'EMPLOYEE' | 'HR';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'RUNNING' | 'EXPIRED' | 'TERMINATED' | 'CANCELLED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'OVERTIME';
export type TimeOffUnit = 'DAYS' | 'HOURS';
export type TimeOffApprovalType = 'MANAGER' | 'OFFICER' | 'NO_VALIDATION';
export type TimeOffRequestStatus = 'DRAFT' | 'PENDING' | 'TO_APPROVE' | 'APPROVED' | 'REJECTED' | 'REFUSED';
export type TimeOffAllocationStatus = 'DRAFT' | 'TO_APPROVE' | 'APPROVED' | 'REFUSED';
export type SalaryRuleCategory = 'BASIC' | 'ALLOWANCE' | 'GROSS' | 'DEDUCTION' | 'NET';
export type ComputationMethod = 'FIXED' | 'PERCENTAGE' | 'FORMULA';
export type PayrunStatus = 'DRAFT' | 'CALCULATING' | 'COMPUTED' | 'VALIDATING' | 'VALIDATED' | 'READY_FOR_APPROVAL' | 'APPROVED' | 'FINALIZED' | 'PAID';
export type PayslipStatus = 'DRAFT' | 'FINALIZED' | 'DONE' | 'CANCELLED';

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
  roleName?: SystemRole;
  status: AccountStatus;
  createdAt: string;
  employeeId?: string | null;
  employee?: { firstName: string; lastName: string; employeeCode?: string } | null;
  employees?: Array<{ id: string; firstName: string; lastName: string; jobTitle?: string }>;
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
  employeeCode?: string;
  firstName: string;
  lastName: string;
  workEmail?: string;
  email?: string;
  workPhone?: string;
  phoneNumber?: string;
  jobPosition?: string;
  jobTitle?: string;
  status: AccountStatus | string;
  workLocation?: string;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  createdAt: string;
  updatedAt?: string;
  departmentId?: string;
  department?: Department | { name: string };
  managerId?: string | null;
  manager?: { firstName: string; lastName: string } | null;
  workingScheduleId?: string | null;
  workingSchedule?: { name: string } | null;
  smartCounts?: SmartCounts;
}

// --- Working Schedule ---
export interface ScheduleDay {
  id?: string;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  breakHours?: number;
  workHours?: number;
}

export interface WorkingSchedule {
  id: string;
  name?: string;
  company?: string;
  daysPerWeek?: number;
  hoursPerWeek?: number;
  timezone?: string;
  status?: AccountStatus | string;
  days?: string[] | ScheduleDay[];
  hours?: number;
  startTime?: string;
  endTime?: string;
  createdAt?: string;
}

// --- Contract ---
export interface Contract {
  id: string;
  contractReference?: string;
  startDate: string;
  endDate?: string | null;
  monthlyWage?: number;
  status: ContractStatus | string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  employeeId: string;
  employee?: { firstName: string; lastName: string; employeeCode?: string };
  salaryStructureId?: string | null;
  salaryStructure?: { name: string; code?: string } | null;
  workingScheduleId?: string | null;
  workingSchedule?: { name?: string } | null;
  departmentId?: string | null;
  department?: { name: string } | null;
}

// --- Attendance ---
export interface Attendance {
  id: string;
  date: string;
  checkIn: string;
  checkOut?: string | null;
  workedHours?: number;
  overtimeHours?: number;
  status: AttendanceStatus | string;
  notes?: string;
  isManualEdit?: boolean;
  employeeId: string;
  employee?: { firstName: string; lastName: string; employeeCode?: string; user?: { name: string } };
  createdAt: string;
}

// --- Time Off ---
export interface TimeOffType {
  id: string;
  name: string;
  unit?: TimeOffUnit;
  requiresAllocation?: boolean;
  approvalType?: TimeOffApprovalType;
  displayColor?: string;
  isPaid?: boolean;
  status?: AccountStatus | string;
  createdAt?: string;
}

export interface TimeOffAllocation {
  id: string;
  allocatedDays?: number;
  totalDays?: number;
  takenDays?: number;
  usedDays?: number;
  remainingDays?: number;
  validityYear?: number;
  description?: string;
  status?: TimeOffAllocationStatus | string;
  employeeId: string;
  employee?: { firstName: string; lastName: string; employeeCode?: string };
  timeOffTypeId: string;
  timeOffType?: TimeOffType;
  createdAt?: string;
}

export interface TimeOffRequest {
  id: string;
  startDate: string;
  endDate: string;
  durationDays?: number;
  reason?: string;
  status: TimeOffRequestStatus | string;
  approverName?: string;
  employeeId: string;
  employee?: { firstName: string; lastName: string; employeeCode?: string };
  timeOffTypeId: string;
  timeOffType?: TimeOffType;
  allocationId?: string | null;
  createdAt: string;
}

// --- Salary ---
export interface SalaryStructure {
  id: string;
  name: string;
  code?: string;
  description?: string;
  version?: number;
  status?: AccountStatus | string;
  createdAt?: string;
  rules?: SalaryRule[];
  _count?: { rules?: number; contracts?: number };
}

export interface SalaryRule {
  id: string;
  name: string;
  code: string;
  category: SalaryRuleCategory | string;
  sequence: number;
  computationType?: ComputationMethod | string;
  computationMethod?: ComputationMethod | string;
  value?: number | null;
  amount?: number | null;
  percentage?: number | null;
  percentageBase?: string | null;
  formula?: string | null;
  dependsOn?: string[];
  status?: AccountStatus | string;
  salaryStructureId?: string;
  structureId?: string;
  salaryStructure?: { name: string; code?: string };
  createdAt?: string;
}

// --- Payrun ---
export interface Payrun {
  id: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  periodStart?: string;
  periodEnd?: string;
  status: PayrunStatus | string;
  totalGross?: number;
  totalNet?: number;
  warningsCount?: number;
  salaryStructureId?: string;
  salaryStructure?: { name: string; code?: string };
  createdAt?: string;
  _count?: { payslips?: number; employees?: number };
}

// --- Payslip ---
export interface PayslipLine {
  id: string;
  code?: string;
  ruleCode?: string;
  name?: string;
  category: SalaryRuleCategory | string;
  amount: number;
  sequence: number;
}

export interface Payslip {
  id: string;
  payslipNumber?: string;
  startDate?: string;
  endDate?: string;
  period?: string;
  date?: string;
  workedDays?: number;
  basicWage?: number;
  grossWage?: number;
  grossAmount?: number;
  netWage?: number;
  netAmount?: number;
  gross?: number;
  net?: number;
  deductions?: number;
  status: PayslipStatus | string;
  warningMessage?: string;
  pdfPath?: string;
  sentEmail?: boolean;
  employeeId: string;
  employee?: { firstName: string; lastName: string; employeeCode?: string; workEmail?: string };
  contractId?: string;
  payrunId: string;
  payrun?: { name: string; status: PayrunStatus | string; periodStart?: string; periodEnd?: string };
  lines?: PayslipLine[];
  createdAt?: string;
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
