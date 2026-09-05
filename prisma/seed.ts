import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54340/peoplepay360?schema=public';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ALL_PERMISSIONS = [
  'EMPLOYEE_CREATE', 'EMPLOYEE_READ', 'EMPLOYEE_UPDATE',
  'CONTRACT_CREATE', 'CONTRACT_READ',
  'ATTENDANCE_CREATE', 'ATTENDANCE_READ', 'ATTENDANCE_UPDATE',
  'TIMEOFF_REQUEST', 'TIMEOFF_APPROVE',
  'PAYRUN_CALCULATE', 'PAYRUN_READ', 'PAYRUN_APPROVE',
  'REPORT_VIEW'
];

interface EmployeeSeedDef {
  firstName: string;
  lastName: string;
  department: string;
  jobTitle: string;
  role?: string;
  email?: string;
  status: 'ACTIVE' | 'TERMINATED';
  wage: number;
  structureKey: 'ENG' | 'HR_OPS' | 'SALES_MKTG' | 'EXEC';
  onLeaveToday?: boolean;
  askingForLeave?: {
    type: string;
    daysAhead: number;
    durationDays: number;
    reason: string;
  };
  hasHistoricalLeave?: {
    type: string;
    daysAgo: number;
    durationDays: number;
    status: 'APPROVED' | 'REJECTED';
  };
}

const EMPLOYEES_DATA: EmployeeSeedDef[] = [
  // ── Executive & Leadership (4) ──────────────────────────────
  { firstName: 'Sarah', lastName: 'Admin', department: 'Executive', jobTitle: 'Chief People Officer', role: 'SUPER_ADMIN', email: 'admin@techcorp.com', status: 'ACTIVE', wage: 15500, structureKey: 'EXEC' },
  { firstName: 'Vikram', lastName: 'Malhotra', department: 'Executive', jobTitle: 'Chief Executive Officer', status: 'ACTIVE', wage: 18000, structureKey: 'EXEC' },
  { firstName: 'Rachel', lastName: 'Greenberg', department: 'Executive', jobTitle: 'VP of Engineering', status: 'ACTIVE', wage: 16000, structureKey: 'EXEC' },
  { firstName: 'Marcus', lastName: 'Vance', department: 'Human Resources', jobTitle: 'Director of HR', role: 'HR_MANAGER', email: 'hrmanager@techcorp.com', status: 'ACTIVE', wage: 11000, structureKey: 'HR_OPS' },

  // ── Engineering (16) ─────────────────────────────────────────
  { firstName: 'Alex', lastName: 'Turner', department: 'Engineering', jobTitle: 'Senior Software Engineer', role: 'EMPLOYEE', email: 'employee@techcorp.com', status: 'ACTIVE', wage: 9500, structureKey: 'ENG',
    askingForLeave: { type: 'Annual Leave', daysAhead: 5, durationDays: 4, reason: 'Family vacation to Colorado' }
  },
  { firstName: 'Elena', lastName: 'Rostova', department: 'Finance & Payroll', jobTitle: 'Payroll Operations Director', role: 'HR_PAYROLL_MANAGER', email: 'payrollmgr@techcorp.com', status: 'ACTIVE', wage: 11500, structureKey: 'HR_OPS' },
  { firstName: 'David', lastName: 'Chen', department: 'Finance & Payroll', jobTitle: 'Senior Payroll Specialist', role: 'HR_PAYROLL_USER', email: 'payrolluser@techcorp.com', status: 'ACTIVE', wage: 7500, structureKey: 'HR_OPS' },
  { firstName: 'Priya', lastName: 'Sharma', department: 'Engineering', jobTitle: 'Staff Backend Engineer', status: 'ACTIVE', wage: 10500, structureKey: 'ENG',
    askingForLeave: { type: 'Sick Leave', daysAhead: 1, durationDays: 2, reason: 'Outpatient surgery and recovery' }
  },
  { firstName: 'Marcus', lastName: 'Williams', department: 'Engineering', jobTitle: 'Fullstack Developer', status: 'ACTIVE', wage: 8200, structureKey: 'ENG',
    onLeaveToday: true // ON LEAVE TODAY
  },
  { firstName: 'James', lastName: 'Okafor', department: 'Engineering', jobTitle: 'Lead DevOps Engineer', status: 'ACTIVE', wage: 11000, structureKey: 'ENG',
    askingForLeave: { type: 'Casual Leave', daysAhead: 3, durationDays: 1, reason: 'Apartment lease relocation' }
  },
  { firstName: 'Lena', lastName: 'Kim', department: 'Engineering', jobTitle: 'Frontend Architect', status: 'ACTIVE', wage: 9800, structureKey: 'ENG',
    onLeaveToday: true // ON LEAVE TODAY
  },
  { firstName: 'Tom', lastName: 'Bradley', department: 'Engineering', jobTitle: 'Senior QA Engineer', status: 'ACTIVE', wage: 7800, structureKey: 'ENG',
    hasHistoricalLeave: { type: 'Annual Leave', daysAgo: 25, durationDays: 5, status: 'APPROVED' }
  },
  { firstName: 'Aisha', lastName: 'Patel', department: 'Engineering', jobTitle: 'Cloud Infrastructure Engineer', status: 'ACTIVE', wage: 8900, structureKey: 'ENG',
    hasHistoricalLeave: { type: 'Sick Leave', daysAgo: 14, durationDays: 1, status: 'APPROVED' }
  },
  { firstName: 'Carlos', lastName: 'Mendoza', department: 'Engineering', jobTitle: 'Mobile App Developer (iOS)', status: 'ACTIVE', wage: 8400, structureKey: 'ENG',
    onLeaveToday: true // ON LEAVE TODAY
  },
  { firstName: 'Ananya', lastName: 'Deshmukh', department: 'Engineering', jobTitle: 'Site Reliability Engineer', status: 'ACTIVE', wage: 9200, structureKey: 'ENG' },
  { firstName: 'Lucas', lastName: 'Silva', department: 'Engineering', jobTitle: 'Software Engineer II', status: 'ACTIVE', wage: 7600, structureKey: 'ENG',
    hasHistoricalLeave: { type: 'Unpaid Leave', daysAgo: 40, durationDays: 3, status: 'REJECTED' }
  },
  { firstName: 'Grace', lastName: 'Hopper', department: 'Engineering', jobTitle: 'Principal Architect', status: 'ACTIVE', wage: 14000, structureKey: 'ENG' },
  { firstName: 'Karthik', lastName: 'Rao', department: 'Engineering', jobTitle: 'Data Platform Engineer', status: 'ACTIVE', wage: 9100, structureKey: 'ENG' },
  { firstName: 'Zoe', lastName: 'Kowalski', department: 'Engineering', jobTitle: 'Junior Frontend Developer', status: 'ACTIVE', wage: 5800, structureKey: 'ENG' },
  { firstName: 'Samir', lastName: 'Nair', department: 'Engineering', jobTitle: 'Security & Compliance Engineer', status: 'ACTIVE', wage: 10200, structureKey: 'ENG' },

  // ── Product & Design (8) ─────────────────────────────────────
  { firstName: 'Sophia', lastName: 'Martinez', department: 'Product & Design', jobTitle: 'Director of Product Management', status: 'ACTIVE', wage: 12500, structureKey: 'EXEC',
    askingForLeave: { type: 'Annual Leave', daysAhead: 12, durationDays: 6, reason: 'Annual international holiday' }
  },
  { firstName: 'Oliver', lastName: 'Bennett', department: 'Product & Design', jobTitle: 'Senior Product Manager', status: 'ACTIVE', wage: 9600, structureKey: 'ENG' },
  { firstName: 'Emily', lastName: 'Watson', department: 'Product & Design', jobTitle: 'Lead UX Researcher', status: 'ACTIVE', wage: 8800, structureKey: 'HR_OPS',
    askingForLeave: { type: 'Parental Leave', daysAhead: 20, durationDays: 30, reason: 'Maternity leave & childcare' }
  },
  { firstName: 'Liam', lastName: 'Nakamura', department: 'Product & Design', jobTitle: 'Senior Product Designer', status: 'ACTIVE', wage: 8600, structureKey: 'ENG',
    hasHistoricalLeave: { type: 'Annual Leave', daysAgo: 30, durationDays: 4, status: 'APPROVED' }
  },
  { firstName: 'Chloe', lastName: 'Dubois', department: 'Product & Design', jobTitle: 'Visual & Brand Designer', status: 'ACTIVE', wage: 6800, structureKey: 'SALES_MKTG' },
  { firstName: 'Maya', lastName: 'Lin', department: 'Product & Design', jobTitle: 'Design System Specialist', status: 'ACTIVE', wage: 7500, structureKey: 'ENG' },
  { firstName: 'Jordan', lastName: 'Lee', department: 'Product & Design', jobTitle: 'Technical Writer & Doc Lead', status: 'ACTIVE', wage: 6400, structureKey: 'HR_OPS' },
  { firstName: 'Arjun', lastName: 'Patel', department: 'Product & Design', jobTitle: 'Associate Product Manager', status: 'ACTIVE', wage: 6200, structureKey: 'ENG',
    onLeaveToday: true // ON LEAVE TODAY
  },

  // ── Human Resources (5) ──────────────────────────────────────
  { firstName: 'Jessica', lastName: 'Alba-Cross', department: 'Human Resources', jobTitle: 'Senior HR Business Partner', status: 'ACTIVE', wage: 7800, structureKey: 'HR_OPS',
    hasHistoricalLeave: { type: 'Sick Leave', daysAgo: 10, durationDays: 1, status: 'APPROVED' }
  },
  { firstName: 'Tariq', lastName: 'Mansoor', department: 'Human Resources', jobTitle: 'Talent Acquisition Lead', status: 'ACTIVE', wage: 7200, structureKey: 'HR_OPS' },
  { firstName: 'Brenda', lastName: 'Fox', department: 'Human Resources', jobTitle: 'People Ops Coordinator', status: 'ACTIVE', wage: 5400, structureKey: 'HR_OPS' },
  { firstName: 'Nate', lastName: 'Archibald', department: 'Human Resources', jobTitle: 'Technical Recruiter', status: 'ACTIVE', wage: 6100, structureKey: 'HR_OPS' },
  { firstName: 'Hannah', lastName: 'Abbott', department: 'Human Resources', jobTitle: 'HR Compliance Officer', status: 'ACTIVE', wage: 6900, structureKey: 'HR_OPS',
    hasHistoricalLeave: { type: 'Casual Leave', daysAgo: 18, durationDays: 2, status: 'APPROVED' }
  },

  // ── Finance & Payroll (4) ────────────────────────────────────
  { firstName: 'Mei', lastName: 'Zhang', department: 'Finance & Payroll', jobTitle: 'Head of Financial Planning', status: 'ACTIVE', wage: 11200, structureKey: 'EXEC',
    hasHistoricalLeave: { type: 'Annual Leave', daysAgo: 50, durationDays: 5, status: 'REJECTED' }
  },
  { firstName: 'Rajesh', lastName: 'Kutty', department: 'Finance & Payroll', jobTitle: 'Senior Corporate Accountant', status: 'ACTIVE', wage: 7100, structureKey: 'HR_OPS' },
  { firstName: 'Arthur', lastName: 'Dent', department: 'Finance & Payroll', jobTitle: 'Billing & Accounts Specialist', status: 'ACTIVE', wage: 5600, structureKey: 'HR_OPS' },
  { firstName: 'Fiona', lastName: 'Gallagher', department: 'Finance & Payroll', jobTitle: 'Financial Analyst', status: 'ACTIVE', wage: 6700, structureKey: 'HR_OPS' },

  // ── Sales & Marketing (10) ───────────────────────────────────
  { firstName: 'David', lastName: 'Rosario', department: 'Sales & Marketing', jobTitle: 'VP of Global Sales', status: 'ACTIVE', wage: 13500, structureKey: 'SALES_MKTG',
    askingForLeave: { type: 'Casual Leave', daysAhead: 7, durationDays: 2, reason: 'Attending sibling wedding' }
  },
  { firstName: 'Siddharth', lastName: 'Verma', department: 'Sales & Marketing', jobTitle: 'Enterprise Account Executive', status: 'ACTIVE', wage: 7900, structureKey: 'SALES_MKTG',
    hasHistoricalLeave: { type: 'Annual Leave', daysAgo: 22, durationDays: 3, status: 'APPROVED' }
  },
  { firstName: 'Kelly', lastName: 'Kapoor', department: 'Sales & Marketing', jobTitle: 'Customer Success Manager', status: 'ACTIVE', wage: 6500, structureKey: 'SALES_MKTG' },
  { firstName: 'Ryan', lastName: 'Howard', department: 'Sales & Marketing', jobTitle: 'Growth & Demand Gen Lead', status: 'ACTIVE', wage: 7400, structureKey: 'SALES_MKTG' },
  { firstName: 'Oscar', lastName: 'Martinez', department: 'Sales & Marketing', jobTitle: 'Senior Sales Engineer', status: 'ACTIVE', wage: 8300, structureKey: 'SALES_MKTG' },
  { firstName: 'Pamela', lastName: 'Beesly', department: 'Sales & Marketing', jobTitle: 'Content & Social Media Strategist', status: 'ACTIVE', wage: 5800, structureKey: 'SALES_MKTG' },
  { firstName: 'Jim', lastName: 'Halpert', department: 'Sales & Marketing', jobTitle: 'Regional Sales Manager', status: 'ACTIVE', wage: 8800, structureKey: 'SALES_MKTG',
    hasHistoricalLeave: { type: 'Annual Leave', daysAgo: 12, durationDays: 4, status: 'APPROVED' }
  },
  { firstName: 'Stanley', lastName: 'Hudson', department: 'Sales & Marketing', jobTitle: 'Key Accounts Director', status: 'ACTIVE', wage: 9100, structureKey: 'SALES_MKTG' },
  { firstName: 'Dwight', lastName: 'Schrute', department: 'Sales & Marketing', jobTitle: 'Assistant Regional Sales Lead', status: 'ACTIVE', wage: 8100, structureKey: 'SALES_MKTG' },
  { firstName: 'Angela', lastName: 'Martin', department: 'Sales & Marketing', jobTitle: 'Sales Operations Analyst', status: 'ACTIVE', wage: 6400, structureKey: 'SALES_MKTG' },

  // ── Operations & Analytics (3) ───────────────────────────────
  { firstName: 'Dmitri', lastName: 'Ivanov', department: 'Operations & Analytics', jobTitle: 'Director of Business Intelligence', status: 'ACTIVE', wage: 10800, structureKey: 'EXEC' },
  { firstName: 'Farah', lastName: 'Zaman', department: 'Operations & Analytics', jobTitle: 'Lead Data Analyst', status: 'ACTIVE', wage: 7900, structureKey: 'ENG' },
  { firstName: 'Tobias', lastName: 'Fünke', department: 'Operations & Analytics', jobTitle: 'Office & Facilities Manager', status: 'ACTIVE', wage: 5200, structureKey: 'HR_OPS' },

  // ── Inactive / Terminated (2) ─────────────────────────────────
  { firstName: 'Roy', lastName: 'Anderson', department: 'Operations & Analytics', jobTitle: 'Warehouse Logistics Lead', status: 'TERMINATED', wage: 4800, structureKey: 'HR_OPS' },
  { firstName: 'Jan', lastName: 'Levinson', department: 'Sales & Marketing', jobTitle: 'Former VP of Sales', status: 'TERMINATED', wage: 13000, structureKey: 'SALES_MKTG' },
];

async function main() {
  console.log('--- Starting PeoplePay360 50-Employee Demo Data Seed ---');

  // 1. Clean existing records in reverse dependency order
  console.log('Cleaning existing records...');
  await prisma.auditLog.deleteMany();
  await prisma.payslipLine.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.payrunEmployee.deleteMany();
  await prisma.payrun.deleteMany();
  await prisma.workingSchedule.deleteMany();
  await prisma.employmentContract.deleteMany();
  await prisma.timeOffRequest.deleteMany();
  await prisma.timeOffAllocation.deleteMany();
  await prisma.timeOffType.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.salaryRule.deleteMany();
  await prisma.salaryStructure.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.organization.deleteMany();

  // 2. Organization
  console.log('Creating organization: TechCorp Industries...');
  const org = await prisma.organization.create({
    data: { name: 'TechCorp Industries' },
  });

  // 3. Roles & Permissions
  console.log('Creating 5 System Roles with RBAC permissions...');
  const rolesMap: Record<string, any> = {};

  rolesMap['SUPER_ADMIN'] = await prisma.role.create({
    data: {
      name: 'SUPER_ADMIN',
      permissions: ALL_PERMISSIONS,
    },
  });

  rolesMap['HR_MANAGER'] = await prisma.role.create({
    data: {
      name: 'HR_MANAGER',
      permissions: [
        'EMPLOYEE_CREATE', 'EMPLOYEE_READ', 'EMPLOYEE_UPDATE',
        'CONTRACT_CREATE', 'CONTRACT_READ',
        'ATTENDANCE_CREATE', 'ATTENDANCE_READ', 'ATTENDANCE_UPDATE',
        'TIMEOFF_REQUEST', 'TIMEOFF_APPROVE',
        'REPORT_VIEW',
      ],
    },
  });

  rolesMap['HR_PAYROLL_MANAGER'] = await prisma.role.create({
    data: {
      name: 'HR_PAYROLL_MANAGER',
      permissions: [
        'EMPLOYEE_READ', 'CONTRACT_READ', 'ATTENDANCE_READ',
        'PAYRUN_CALCULATE', 'PAYRUN_READ', 'PAYRUN_APPROVE',
        'REPORT_VIEW',
      ],
    },
  });

  rolesMap['HR_PAYROLL_USER'] = await prisma.role.create({
    data: {
      name: 'HR_PAYROLL_USER',
      permissions: [
        'EMPLOYEE_READ', 'CONTRACT_READ', 'ATTENDANCE_READ',
        'PAYRUN_CALCULATE', 'PAYRUN_READ',
        'REPORT_VIEW',
      ],
    },
  });

  rolesMap['EMPLOYEE'] = await prisma.role.create({
    data: {
      name: 'EMPLOYEE',
      permissions: [
        'EMPLOYEE_READ',
        'ATTENDANCE_READ', 'ATTENDANCE_CREATE',
        'TIMEOFF_REQUEST',
      ],
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  // 4. Time Off Types
  console.log('Creating 5 Time Off Types...');
  const timeOffTypes: Record<string, any> = {};
  const typesData = [
    { name: 'Annual Leave', isPaid: true },
    { name: 'Sick Leave', isPaid: true },
    { name: 'Casual Leave', isPaid: true },
    { name: 'Parental Leave', isPaid: true },
    { name: 'Unpaid Leave', isPaid: false },
  ];

  for (const t of typesData) {
    const created = await prisma.timeOffType.create({
      data: {
        orgId: org.id,
        name: t.name,
        isPaid: t.isPaid,
      },
    });
    timeOffTypes[t.name] = created;
  }

  // 5. Salary Structures & Rules
  console.log('Creating 4 Salary Structures with full calculation rules...');
  const structureDefs = [
    { key: 'ENG', name: 'Engineering & Technology Package', basicVal: 8000, taxVal: 400 },
    { key: 'HR_OPS', name: 'Operations & HR Support Package', basicVal: 6000, taxVal: 300 },
    { key: 'SALES_MKTG', name: 'Sales & Growth Performance Package', basicVal: 5500, taxVal: 250 },
    { key: 'EXEC', name: 'Executive & Strategic Leadership Package', basicVal: 12000, taxVal: 800 },
  ];

  const structuresMap: Record<string, any> = {};

  for (const s of structureDefs) {
    const struct = await prisma.salaryStructure.create({
      data: {
        orgId: org.id,
        name: s.name,
        version: 1,
        status: 'ACTIVE',
      },
    });
    structuresMap[s.key] = struct;

    await prisma.salaryRule.createMany({
      data: [
        {
          structureId: struct.id,
          code: 'BASIC',
          name: 'Basic Salary',
          category: 'BASIC',
          computationType: 'FIXED',
          sequence: 10,
          value: s.basicVal,
          dependsOn: [],
        },
        {
          structureId: struct.id,
          code: 'HRA',
          name: 'House Rent Allowance',
          category: 'ALLOWANCE',
          computationType: 'PERCENTAGE',
          sequence: 20,
          value: 30, // 30% of Basic
          dependsOn: ['BASIC'],
        },
        {
          structureId: struct.id,
          code: 'SPECIAL',
          name: 'Special Allowance',
          category: 'ALLOWANCE',
          computationType: 'FIXED',
          sequence: 25,
          value: 1200,
          dependsOn: [],
        },
        {
          structureId: struct.id,
          code: 'PF',
          name: 'Provident Fund',
          category: 'DEDUCTION',
          computationType: 'PERCENTAGE',
          sequence: 30,
          value: 12, // 12% of Basic
          dependsOn: ['BASIC'],
        },
        {
          structureId: struct.id,
          code: 'TAX',
          name: 'Professional & Income Tax',
          category: 'DEDUCTION',
          computationType: 'FIXED',
          sequence: 40,
          value: s.taxVal,
          dependsOn: [],
        },
        {
          structureId: struct.id,
          code: 'NET',
          name: 'Net Salary',
          category: 'NET',
          computationType: 'FORMULA',
          sequence: 99,
          value: 0,
          dependsOn: ['BASIC', 'HRA', 'SPECIAL', 'PF', 'TAX'],
        },
      ],
    });
  }

  // 6. Create 50 Employees, Users, Contracts, Working Schedules & Allocations
  console.log(`Creating ${EMPLOYEES_DATA.length} employees with contracts, schedules and time-off allocations...`);
  const createdEmployees: any[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < EMPLOYEES_DATA.length; i++) {
    const item = EMPLOYEES_DATA[i];
    let createdUser: any = null;

    // Create User account if employee has designated role or email
    const userEmail = item.email || `${item.firstName.toLowerCase()}.${item.lastName.toLowerCase()}@techcorp.com`;
    const roleName = item.role || 'EMPLOYEE';
    const assignedRole = rolesMap[roleName] || rolesMap['EMPLOYEE'];

    createdUser = await prisma.user.create({
      data: {
        orgId: org.id,
        roleId: assignedRole.id,
        email: userEmail,
        passwordHash,
        status: item.status === 'TERMINATED' ? 'INACTIVE' : 'ACTIVE',
      },
    });

    const emp = await prisma.employee.create({
      data: {
        orgId: org.id,
        userId: createdUser.id,
        firstName: item.firstName,
        lastName: item.lastName,
        status: item.status,
      },
    });

    createdEmployees.push({
      ...item,
      id: emp.id,
      userId: createdUser.id,
      userEmail,
    });

    // Create Contract & Working Schedule
    const contractStartDate = new Date(2022, 0, 1 + (i % 28));
    const struct = structuresMap[item.structureKey];

    const contract = await prisma.employmentContract.create({
      data: {
        employeeId: emp.id,
        salaryStructureId: struct.id,
        startDate: contractStartDate,
        endDate: item.status === 'TERMINATED' ? new Date(2026, 7, 31) : null,
        status: item.status === 'TERMINATED' ? 'TERMINATED' : 'ACTIVE',
      },
    });

    await prisma.workingSchedule.create({
      data: {
        contractId: contract.id,
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        hours: 8,
      },
    });

    // Time-Off Allocations (Annual 24 days, Sick 12 days, Casual 7 days)
    const annualUsed = item.onLeaveToday ? 4 : (i % 5);
    await prisma.timeOffAllocation.createMany({
      data: [
        { employeeId: emp.id, typeId: timeOffTypes['Annual Leave'].id, totalDays: 24, usedDays: annualUsed },
        { employeeId: emp.id, typeId: timeOffTypes['Sick Leave'].id, totalDays: 12, usedDays: i % 3 },
        { employeeId: emp.id, typeId: timeOffTypes['Casual Leave'].id, totalDays: 7, usedDays: i % 2 },
      ],
    });
  }

  // 7. Seed Time-Off Requests
  console.log('Seeding leave requests: Pending, On Leave Today, and Historical...');

  // A. ON LEAVE TODAY (Status = APPROVED, covering today)
  for (const emp of createdEmployees.filter(e => e.onLeaveToday)) {
    const start = new Date(today);
    start.setDate(today.getDate() - 2);
    const end = new Date(today);
    end.setDate(today.getDate() + 3);

    await prisma.timeOffRequest.create({
      data: {
        employeeId: emp.id,
        typeId: timeOffTypes['Annual Leave'].id,
        startDate: start,
        endDate: end,
        status: 'APPROVED',
      },
    });
  }

  // B. ASKING FOR LEAVE (Status = PENDING, requires approval)
  for (const emp of createdEmployees.filter(e => e.askingForLeave)) {
    const cfg = emp.askingForLeave!;
    const start = new Date(today);
    start.setDate(today.getDate() + cfg.daysAhead);
    const end = new Date(start);
    end.setDate(start.getDate() + cfg.durationDays - 1);

    const typeObj = timeOffTypes[cfg.type] || timeOffTypes['Annual Leave'];

    await prisma.timeOffRequest.create({
      data: {
        employeeId: emp.id,
        typeId: typeObj.id,
        startDate: start,
        endDate: end,
        status: 'PENDING',
      },
    });
  }

  // C. HISTORICAL LEAVES (APPROVED & REJECTED)
  for (const emp of createdEmployees.filter(e => e.hasHistoricalLeave)) {
    const cfg = emp.hasHistoricalLeave!;
    const start = new Date(today);
    start.setDate(today.getDate() - cfg.daysAgo);
    const end = new Date(start);
    end.setDate(start.getDate() + cfg.durationDays - 1);

    const typeObj = timeOffTypes[cfg.type] || timeOffTypes['Annual Leave'];

    await prisma.timeOffRequest.create({
      data: {
        employeeId: emp.id,
        typeId: typeObj.id,
        startDate: start,
        endDate: end,
        status: cfg.status,
      },
    });
  }

  // 8. Seed Attendance (Past 5 Days)
  console.log('Seeding attendance records for past 5 working days...');
  const pastDays: Date[] = [];
  for (let d = 4; d >= 0; d--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - d);
    dt.setHours(0, 0, 0, 0);
    pastDays.push(dt);
  }

  const attendanceBatch: any[] = [];
  for (const emp of createdEmployees) {
    if (emp.status === 'TERMINATED') continue;

    for (const dt of pastDays) {
      // If employee is on leave today and dt is recent, mark absent
      const isAbsent = (emp.onLeaveToday && dt.getTime() >= today.getTime() - 2 * 86400000) || (Math.random() < 0.05);

      const checkIn = new Date(dt);
      checkIn.setHours(8, 50 + Math.floor(Math.random() * 30), 0); // 8:50 - 9:20 AM

      const checkOut = new Date(dt);
      checkOut.setHours(17, 15 + Math.floor(Math.random() * 45), 0); // 5:15 - 6:00 PM

      const hours = isAbsent ? 0 : 8.25;

      attendanceBatch.push({
        employeeId: emp.id,
        date: dt,
        checkIn,
        checkOut: isAbsent ? null : checkOut,
        workedHours: hours,
        status: isAbsent ? 'ABSENT' : 'PRESENT',
      });
    }
  }

  for (const att of attendanceBatch) {
    await prisma.attendance.create({ data: att });
  }

  // 9. Seed Payruns & Payslips
  console.log('Seeding finalized previous month payrun (August 2026) with payslips and line items...');
  const augStart = new Date(2026, 7, 1);
  const augEnd = new Date(2026, 7, 31);

  const finalizedPayrun = await prisma.payrun.create({
    data: {
      orgId: org.id,
      periodStart: augStart,
      periodEnd: augEnd,
      status: 'FINALIZED',
    },
  });

  // Current Month Draft Payrun
  const sepStart = new Date(2026, 8, 1);
  const sepEnd = new Date(2026, 8, 30);

  const draftPayrun = await prisma.payrun.create({
    data: {
      orgId: org.id,
      periodStart: sepStart,
      periodEnd: sepEnd,
      status: 'DRAFT',
    },
  });

  // Payslips for active employees in August
  console.log('Generating detailed payslips with rule breakdowns...');
  for (const emp of createdEmployees) {
    if (emp.status === 'TERMINATED') continue;

    // Link employee to draft & finalized payruns
    await prisma.payrunEmployee.createMany({
      data: [
        { payrunId: finalizedPayrun.id, employeeId: emp.id, status: 'INCLUDED' },
        { payrunId: draftPayrun.id, employeeId: emp.id, status: 'INCLUDED' },
      ],
    });

    const wage = emp.wage;
    const basic = Math.round(wage * 0.5);
    const hra = Math.round(basic * 0.4);
    const allowance = wage - basic - hra;
    const pf = Math.round(basic * 0.12);
    const tax = Math.round(wage * 0.08);
    const gross = wage;
    const net = gross - pf - tax;

    const payslip = await prisma.payslip.create({
      data: {
        payrunId: finalizedPayrun.id,
        employeeId: emp.id,
        grossAmount: gross,
        netAmount: net,
        status: 'FINALIZED',
      },
    });

    await prisma.payslipLine.createMany({
      data: [
        { payslipId: payslip.id, ruleCode: 'BASIC', category: 'BASIC', amount: basic, sequence: 10, metadata: JSON.stringify({ name: 'Basic Salary' }) },
        { payslipId: payslip.id, ruleCode: 'HRA', category: 'ALLOWANCE', amount: hra, sequence: 20, metadata: JSON.stringify({ name: 'House Rent Allowance (40%)' }) },
        { payslipId: payslip.id, ruleCode: 'SPECIAL', category: 'ALLOWANCE', amount: allowance, sequence: 25, metadata: JSON.stringify({ name: 'Special Allowance' }) },
        { payslipId: payslip.id, ruleCode: 'PF', category: 'DEDUCTION', amount: pf, sequence: 30, metadata: JSON.stringify({ name: 'Provident Fund (12%)' }) },
        { payslipId: payslip.id, ruleCode: 'TAX', category: 'DEDUCTION', amount: tax, sequence: 40, metadata: JSON.stringify({ name: 'Income Tax' }) },
        { payslipId: payslip.id, ruleCode: 'NET', category: 'NET', amount: net, sequence: 99, metadata: JSON.stringify({ name: 'Net Pay' }) },
      ],
    });
  }

  // 10. Audit Log
  await prisma.auditLog.create({
    data: {
      orgId: org.id,
      actorId: createdEmployees[0].userId,
      action: 'SYSTEM_SEED',
      entity: 'Organization',
      entityId: org.id,
      metadata: JSON.stringify({ note: '50-employee demo seed initialized for presentation' }),
    },
  });

  console.log('---------------------------------------------------------');
  console.log('✅ Demo Seed Completed Successfully!');
  console.log(`• Organization: TechCorp Industries`);
  console.log(`• Total Employees: ${createdEmployees.length} (44 Active, 4 On Leave, 2 Inactive)`);
  console.log(`• Pending Leave Requests: 6 (shows in Approvals & Time Off)`);
  console.log(`• Employees On Leave Today: 4 (shows on Dashboard metric & employee status)`);
  console.log(`• Attendance: ${attendanceBatch.length} records across 5 past working days`);
  console.log(`• Contracts & Working Schedules: ${createdEmployees.length} active`);
  console.log(`• Payruns: 1 Finalized (August 2026 with payslips) & 1 Draft (September 2026)`);
  console.log('---------------------------------------------------------');
  console.log('🔑 Role Logins for Presentation:');
  console.log('1. System Admin:     admin@techcorp.com        / password123 (Sarah Admin)');
  console.log('2. HR Manager:       hrmanager@techcorp.com    / password123 (Marcus Vance)');
  console.log('3. Payroll Manager:  payrollmgr@techcorp.com   / password123 (Elena Rostova)');
  console.log('4. Payroll User:     payrolluser@techcorp.com  / password123 (David Chen)');
  console.log('5. Employee:         employee@techcorp.com     / password123 (Alex Turner)');
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seed script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
