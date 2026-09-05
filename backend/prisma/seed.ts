import { PrismaClient, SystemRole, AccountStatus, ContractStatus, TimeOffUnit, TimeOffApprovalType, TimeOffAllocationStatus, TimeOffRequestStatus, SalaryRuleCategory, ComputationMethod, PayrunStatus, PayslipStatus, AttendanceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.payslipLine.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.payrun.deleteMany();
  await prisma.salaryRule.deleteMany();
  await prisma.salaryStructure.deleteMany();
  await prisma.timeOffRequest.deleteMany();
  await prisma.timeOffAllocation.deleteMany();
  await prisma.timeOffType.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.scheduleDay.deleteMany();
  await prisma.workingSchedule.deleteMany();
  await prisma.department.deleteMany();

  // 1. Create Departments
  const deptFinance = await prisma.department.create({
    data: { name: 'Finance', code: 'FIN', description: 'Financial Operations and Payroll' },
  });
  const deptHR = await prisma.department.create({
    data: { name: 'HR', code: 'HR', description: 'Human Resource Operations' },
  });
  const deptEng = await prisma.department.create({
    data: { name: 'Engineering', code: 'ENG', description: 'Software Development' },
  });

  // 2. Create Working Schedule
  const schedule40 = await prisma.workingSchedule.create({
    data: {
      name: '40 Hours / Week',
      company: 'OXP Pvt Ltd',
      daysPerWeek: 5,
      hoursPerWeek: 40.0,
      timezone: 'Asia/Kolkata',
      status: AccountStatus.ACTIVE,
      days: {
        create: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map(day => ({
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          breakHours: 1.0,
          workHours: 8.0,
        })),
      },
    },
  });

  // 3. Create Time Off Types
  const leavePTO = await prisma.timeOffType.create({
    data: {
      name: 'Paid Time Off',
      unit: TimeOffUnit.DAYS,
      requiresAllocation: true,
      approvalType: TimeOffApprovalType.MANAGER,
      displayColor: '#3B82F6',
    },
  });
  const leaveSick = await prisma.timeOffType.create({
    data: {
      name: 'Sick Leave',
      unit: TimeOffUnit.DAYS,
      requiresAllocation: false,
      approvalType: TimeOffApprovalType.MANAGER,
      displayColor: '#EF4444',
    },
  });
  const leaveComp = await prisma.timeOffType.create({
    data: {
      name: 'Comp Off',
      unit: TimeOffUnit.HOURS,
      requiresAllocation: true,
      approvalType: TimeOffApprovalType.OFFICER,
      displayColor: '#10B981',
    },
  });

  // 4. Create Salary Structure & Rules
  const regularStructure = await prisma.salaryStructure.create({
    data: {
      name: 'Regular Salary',
      code: 'REGULAR',
      description: 'Standard full-time salary structure with statutory allowances and deductions',
    },
  });

  const ruleBasic = await prisma.salaryRule.create({
    data: {
      name: 'Basic Salary',
      code: 'BASIC',
      category: SalaryRuleCategory.BASIC,
      sequence: 1,
      computationMethod: ComputationMethod.PERCENTAGE,
      percentage: 50.0,
      percentageBase: 'WAGE',
      salaryStructureId: regularStructure.id,
    },
  });

  const ruleHRA = await prisma.salaryRule.create({
    data: {
      name: 'House Rent Allowance',
      code: 'HRA',
      category: SalaryRuleCategory.ALLOWANCE,
      sequence: 10,
      computationMethod: ComputationMethod.PERCENTAGE,
      percentage: 40.0,
      percentageBase: 'BASIC',
      salaryStructureId: regularStructure.id,
    },
  });

  const ruleSTD = await prisma.salaryRule.create({
    data: {
      name: 'Standard Allowance',
      code: 'STD',
      category: SalaryRuleCategory.ALLOWANCE,
      sequence: 20,
      computationMethod: ComputationMethod.FIXED,
      amount: 10000.0,
      salaryStructureId: regularStructure.id,
    },
  });

  const ruleGross = await prisma.salaryRule.create({
    data: {
      name: 'Gross Salary',
      code: 'GROSS',
      category: SalaryRuleCategory.GROSS,
      sequence: 40,
      computationMethod: ComputationMethod.FORMULA,
      formula: 'BASIC + HRA + STD',
      salaryStructureId: regularStructure.id,
    },
  });

  const rulePF = await prisma.salaryRule.create({
    data: {
      name: 'Provident Fund',
      code: 'PF',
      category: SalaryRuleCategory.DEDUCTION,
      sequence: 50,
      computationMethod: ComputationMethod.PERCENTAGE,
      percentage: 12.0,
      percentageBase: 'BASIC',
      salaryStructureId: regularStructure.id,
    },
  });

  const rulePT = await prisma.salaryRule.create({
    data: {
      name: 'Professional Tax',
      code: 'PT',
      category: SalaryRuleCategory.DEDUCTION,
      sequence: 60,
      computationMethod: ComputationMethod.FIXED,
      amount: 2000.0,
      salaryStructureId: regularStructure.id,
    },
  });

  const ruleNet = await prisma.salaryRule.create({
    data: {
      name: 'Net Salary',
      code: 'NET',
      category: SalaryRuleCategory.NET,
      sequence: 100,
      computationMethod: ComputationMethod.FORMULA,
      formula: 'GROSS - PF - PT',
      salaryStructureId: regularStructure.id,
    },
  });

  // Password hashes
  const passwordHashUser = await bcrypt.hash('Password123!', 10);
  const passwordHashAdmin = await bcrypt.hash('AdminPassword123!', 10);

  // 5. Create Employees
  // Sara Khan (Manager)
  const empSara = await prisma.employee.create({
    data: {
      employeeCode: 'EMP002',
      firstName: 'Sara',
      lastName: 'Khan',
      workEmail: 'sara@oxp.com',
      workPhone: '+91 98765 43211',
      jobPosition: 'HR Officer',
      status: AccountStatus.ACTIVE,
      workLocation: 'Mumbai',
      bankAccountNumber: '987654321012',
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0001234',
      departmentId: deptHR.id,
      workingScheduleId: schedule40.id,
    },
  });

  // Aarav Mehta (HR Payroll Manager)
  const empAarav = await prisma.employee.create({
    data: {
      employeeCode: 'EMP001',
      firstName: 'Aarav',
      lastName: 'Mehta',
      workEmail: 'aarav@oxp.com',
      workPhone: '+91 98765 43210',
      jobPosition: 'Payroll Specialist',
      status: AccountStatus.ACTIVE,
      workLocation: 'Mumbai',
      bankAccountNumber: '123456789012',
      bankName: 'ICICI Bank',
      ifscCode: 'ICIC0000456',
      departmentId: deptFinance.id,
      managerId: empSara.id,
      workingScheduleId: schedule40.id,
    },
  });

  // John Dsouza (Employee)
  const empJohn = await prisma.employee.create({
    data: {
      employeeCode: 'EMP003',
      firstName: 'John',
      lastName: 'Dsouza',
      workEmail: 'john@oxp.com',
      workPhone: '+91 98765 43212',
      jobPosition: 'Senior Developer',
      status: AccountStatus.ACTIVE,
      workLocation: 'Mumbai',
      bankAccountNumber: '456789012345',
      bankName: 'State Bank of India',
      ifscCode: 'SBIN0000789',
      departmentId: deptEng.id,
      managerId: empSara.id,
      workingScheduleId: schedule40.id,
    },
  });

  // Neha Patel (HR Payroll User)
  const empNeha = await prisma.employee.create({
    data: {
      employeeCode: 'EMP004',
      firstName: 'Neha',
      lastName: 'Patel',
      workEmail: 'neha@oxp.com',
      workPhone: '+91 98765 43213',
      jobPosition: 'Recruiter',
      status: AccountStatus.ACTIVE,
      workLocation: 'Mumbai',
      bankAccountNumber: '789012345678',
      bankName: 'Axis Bank',
      ifscCode: 'UTIB0000321',
      departmentId: deptHR.id,
      managerId: empSara.id,
      workingScheduleId: schedule40.id,
    },
  });

  // 6. Create Users linked to Employees
  await prisma.user.create({
    data: {
      name: 'Aarav Mehta',
      email: 'aarav@oxp.com',
      passwordHash: passwordHashUser,
      role: SystemRole.HR_PAYROLL_MANAGER,
      status: AccountStatus.ACTIVE,
      employeeId: empAarav.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Sara Khan',
      email: 'sara@oxp.com',
      passwordHash: passwordHashUser,
      role: SystemRole.HR_MANAGER,
      status: AccountStatus.ACTIVE,
      employeeId: empSara.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'John Dsouza',
      email: 'john@oxp.com',
      passwordHash: passwordHashUser,
      role: SystemRole.EMPLOYEE,
      status: AccountStatus.ACTIVE,
      employeeId: empJohn.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Neha Patel',
      email: 'neha@oxp.com',
      passwordHash: passwordHashUser,
      role: SystemRole.HR_PAYROLL_USER,
      status: AccountStatus.ACTIVE,
      employeeId: empNeha.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@oxp.com',
      passwordHash: passwordHashAdmin,
      role: SystemRole.ADMIN,
      status: AccountStatus.ACTIVE,
    },
  });

  // 7. Create Contracts
  const contractAarav = await prisma.contract.create({
    data: {
      contractReference: 'CON/2026/0042',
      employeeId: empAarav.id,
      departmentId: deptFinance.id,
      workingScheduleId: schedule40.id,
      salaryStructureId: regularStructure.id,
      startDate: new Date('2026-01-01'),
      monthlyWage: 85000,
      status: ContractStatus.RUNNING,
      notes: 'Active contract source for payroll calculations',
    },
  });

  const contractSara = await prisma.contract.create({
    data: {
      contractReference: 'CON/2026/0031',
      employeeId: empSara.id,
      departmentId: deptHR.id,
      workingScheduleId: schedule40.id,
      salaryStructureId: regularStructure.id,
      startDate: new Date('2026-01-01'),
      monthlyWage: 95000,
      status: ContractStatus.RUNNING,
    },
  });

  const contractJohn = await prisma.contract.create({
    data: {
      contractReference: 'CON/2026/0018',
      employeeId: empJohn.id,
      departmentId: deptEng.id,
      workingScheduleId: schedule40.id,
      salaryStructureId: regularStructure.id,
      startDate: new Date('2026-01-01'),
      monthlyWage: 78000,
      status: ContractStatus.RUNNING,
    },
  });

  const contractNeha = await prisma.contract.create({
    data: {
      contractReference: 'CON/2026/0055',
      employeeId: empNeha.id,
      departmentId: deptHR.id,
      workingScheduleId: schedule40.id,
      salaryStructureId: regularStructure.id,
      startDate: new Date('2026-01-01'),
      monthlyWage: 70000,
      status: ContractStatus.RUNNING,
    },
  });

  // 8. Create Attendance Records
  const today = new Date();
  await prisma.attendance.create({
    data: {
      employeeId: empAarav.id,
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      checkIn: new Date(today.setHours(9, 5, 0)),
      checkOut: new Date(today.setHours(18, 10, 0)),
      workedHours: 9.08,
      overtimeHours: 0.5,
      status: AttendanceStatus.PRESENT,
      notes: 'Regular check in via widget',
    },
  });

  // 9. Create Time Off Allocations & Requests
  const allocAarav = await prisma.timeOffAllocation.create({
    data: {
      employeeId: empAarav.id,
      timeOffTypeId: leavePTO.id,
      allocatedDays: 20.0,
      takenDays: 8.0,
      remainingDays: 12.0,
      validityYear: 2026,
      description: 'Annual leave balance granted at start of policy year',
      status: TimeOffAllocationStatus.APPROVED,
    },
  });

  await prisma.timeOffRequest.create({
    data: {
      employeeId: empAarav.id,
      timeOffTypeId: leavePTO.id,
      allocationId: allocAarav.id,
      startDate: new Date('2026-09-12'),
      endDate: new Date('2026-09-14'),
      durationDays: 3.0,
      reason: 'Family vacation',
      status: TimeOffRequestStatus.APPROVED,
      approverName: 'Sara Khan',
    },
  });

  // 10. Create Historical Payrun & Payslips for February 2026
  const payrunFeb = await prisma.payrun.create({
    data: {
      name: 'February 2026',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-28'),
      salaryStructureId: regularStructure.id,
      status: PayrunStatus.VALIDATED,
      totalGross: 320000,
      totalNet: 288000,
      warningsCount: 1,
    },
  });

  // Create Payslip for Aarav
  // Wage: 85,000 => Basic: 42,500, HRA: 17,000, STD: 10,000 => Gross: 69,500
  // PF: 5,100, PT: 2,000 => Deductions: 7,100 => Net: 62,400
  const payslipAarav = await prisma.payslip.create({
    data: {
      payslipNumber: 'SLIP/2026/02/001',
      employeeId: empAarav.id,
      contractId: contractAarav.id,
      payrunId: payrunFeb.id,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-28'),
      workedDays: 22.0,
      basicWage: 42500,
      grossWage: 69500,
      netWage: 62400,
      status: PayslipStatus.DONE,
      lines: {
        create: [
          { code: 'BASIC', name: 'Basic Salary', category: SalaryRuleCategory.BASIC, amount: 42500, sequence: 1 },
          { code: 'HRA', name: 'House Rent Allowance', category: SalaryRuleCategory.ALLOWANCE, amount: 17000, sequence: 10 },
          { code: 'STD', name: 'Standard Allowance', category: SalaryRuleCategory.ALLOWANCE, amount: 10000, sequence: 20 },
          { code: 'GROSS', name: 'Gross Salary', category: SalaryRuleCategory.GROSS, amount: 69500, sequence: 40 },
          { code: 'PF', name: 'Provident Fund', category: SalaryRuleCategory.DEDUCTION, amount: 5100, sequence: 50 },
          { code: 'PT', name: 'Professional Tax', category: SalaryRuleCategory.DEDUCTION, amount: 2000, sequence: 60 },
          { code: 'NET', name: 'Net Salary', category: SalaryRuleCategory.NET, amount: 62400, sequence: 100 },
        ],
      },
    },
  });

  console.log('--- Seeding Completed Successfully ---');
}

main()
  .catch(e => {
    console.error('Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
