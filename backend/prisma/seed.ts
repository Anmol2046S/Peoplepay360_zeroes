import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/peoplepay360?schema=public';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ALL_PERMISSIONS = [
  'USER_MANAGE', 'ROLE_MANAGE',
  'EMPLOYEE_CREATE', 'EMPLOYEE_READ', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE',
  'CONTRACT_CREATE', 'CONTRACT_READ', 'CONTRACT_UPDATE',
  'ATTENDANCE_CREATE', 'ATTENDANCE_READ', 'ATTENDANCE_UPDATE',
  'TIMEOFF_REQUEST', 'TIMEOFF_APPROVE',
  'PAYRUN_CALCULATE', 'PAYRUN_READ', 'PAYRUN_APPROVE',
  'STRUCTURE_READ', 'STRUCTURE_WRITE',
  'REPORT_VIEW'
];

async function main() {
  console.log('Seeding database (clearing existing data first)...');

  // Clear data in reverse dependency order
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

  console.log('Inserting new demo data matching PDF 5 Roles...');

  // 1. Organization
  const org = await prisma.organization.create({
    data: {
      name: 'TechCorp Industries',
    },
  });

  // 2. Roles (5 Roles matching PDF Page 3)
  const adminRole = await prisma.role.create({
    data: {
      name: 'SUPER_ADMIN',
      permissions: ALL_PERMISSIONS,
    },
  });

  const hrPayrollMgrRole = await prisma.role.create({
    data: {
      name: 'HR_PAYROLL_MANAGER',
      permissions: [
        'EMPLOYEE_CREATE', 'EMPLOYEE_READ', 'EMPLOYEE_UPDATE',
        'CONTRACT_CREATE', 'CONTRACT_READ', 'CONTRACT_UPDATE',
        'ATTENDANCE_CREATE', 'ATTENDANCE_READ', 'ATTENDANCE_UPDATE',
        'TIMEOFF_REQUEST', 'TIMEOFF_APPROVE',
        'PAYRUN_CALCULATE', 'PAYRUN_READ', 'PAYRUN_APPROVE',
        'STRUCTURE_READ', 'STRUCTURE_WRITE',
        'REPORT_VIEW'
      ],
    },
  });

  const hrPayrollUserRole = await prisma.role.create({
    data: {
      name: 'HR_PAYROLL_USER',
      permissions: [
        'EMPLOYEE_CREATE', 'EMPLOYEE_READ', 'EMPLOYEE_UPDATE',
        'CONTRACT_CREATE', 'CONTRACT_READ',
        'ATTENDANCE_CREATE', 'ATTENDANCE_READ', 'ATTENDANCE_UPDATE',
        'TIMEOFF_REQUEST', 'TIMEOFF_APPROVE',
        'PAYRUN_CALCULATE', 'PAYRUN_READ',
        'STRUCTURE_READ',
        'REPORT_VIEW'
      ],
    },
  });

  const hrMgrRole = await prisma.role.create({
    data: {
      name: 'HR_MANAGER',
      permissions: [
        'EMPLOYEE_CREATE', 'EMPLOYEE_READ', 'EMPLOYEE_UPDATE',
        'CONTRACT_CREATE', 'CONTRACT_READ',
        'ATTENDANCE_CREATE', 'ATTENDANCE_READ', 'ATTENDANCE_UPDATE',
        'TIMEOFF_REQUEST', 'TIMEOFF_APPROVE',
        'PAYRUN_CALCULATE', 'PAYRUN_READ', 'PAYRUN_APPROVE',
        'STRUCTURE_READ', 'STRUCTURE_WRITE',
        'REPORT_VIEW'
      ],
    },
  });

  const employeeRole = await prisma.role.create({
    data: {
      name: 'EMPLOYEE',
      permissions: [
        'ATTENDANCE_SELF',
        'TIMEOFF_REQUEST_SELF',
        'PAYSLIP_READ_SELF'
      ],
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Demo Users
  const adminUser = await prisma.user.create({
    data: { orgId: org.id, roleId: adminRole.id, email: 'admin@techcorp.com', passwordHash, status: 'ACTIVE' },
  });

  const hrPayrollMgrUser = await prisma.user.create({
    data: { orgId: org.id, roleId: hrPayrollMgrRole.id, email: 'payrollmgr@techcorp.com', passwordHash, status: 'ACTIVE' },
  });

  const hrPayrollUser = await prisma.user.create({
    data: { orgId: org.id, roleId: hrPayrollUserRole.id, email: 'payrolluser@techcorp.com', passwordHash, status: 'ACTIVE' },
  });

  const hrMgrUser = await prisma.user.create({
    data: { orgId: org.id, roleId: hrMgrRole.id, email: 'hrmanager@techcorp.com', passwordHash, status: 'ACTIVE' },
  });

  const employeeUser = await prisma.user.create({
    data: { orgId: org.id, roleId: employeeRole.id, email: 'employee@techcorp.com', passwordHash, status: 'ACTIVE' },
  });

  // 4. Salary Structure
  const structure = await prisma.salaryStructure.create({
    data: {
      orgId: org.id,
      name: 'Standard Developer Package',
    },
  });

  await prisma.salaryRule.createMany({
    data: [
      {
        structureId: structure.id,
        code: 'BASIC',
        name: 'Basic Salary',
        category: 'BASIC',
        computationType: 'FIXED',
        sequence: 10,
        value: 5000,
        dependsOn: [],
      },
      {
        structureId: structure.id,
        code: 'HRA',
        name: 'House Rent Allowance',
        category: 'ALLOWANCE',
        computationType: 'PERCENTAGE',
        sequence: 20,
        value: 40,
        dependsOn: ['BASIC'],
      },
      {
        structureId: structure.id,
        code: 'PF',
        name: 'Provident Fund',
        category: 'DEDUCTION',
        computationType: 'PERCENTAGE',
        sequence: 30,
        value: 12,
        dependsOn: ['BASIC'],
      },
      {
        structureId: structure.id,
        code: 'TAX',
        name: 'Income Tax',
        category: 'DEDUCTION',
        computationType: 'FIXED',
        sequence: 40,
        value: 200,
        dependsOn: [],
      },
      {
        structureId: structure.id,
        code: 'NET',
        name: 'Net Pay',
        category: 'NET',
        computationType: 'FORMULA',
        sequence: 99,
        value: 0,
        dependsOn: ['BASIC', 'HRA', 'PF', 'TAX'],
      }
    ]
  });

  // 5. Employees & Contracts
  const e1 = await prisma.employee.create({
    data: {
      orgId: org.id,
      firstName: 'Alice',
      lastName: 'Smith',
      userId: employeeUser.id,
      status: 'ACTIVE',
    }
  });

  const e2 = await prisma.employee.create({
    data: {
      orgId: org.id,
      firstName: 'Aarav',
      lastName: 'Mehta',
      userId: hrMgrUser.id,
      status: 'ACTIVE',
    }
  });

  const d = new Date();
  d.setDate(1);
  d.setUTCHours(0,0,0,0);

  const c1 = await prisma.employmentContract.create({
    data: {
      employeeId: e1.id,
      salaryStructureId: structure.id,
      startDate: d,
      status: 'ACTIVE'
    }
  });

  await prisma.workingSchedule.create({
    data: {
      contractId: c1.id,
      days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      hours: 8,
    }
  });

  const c2 = await prisma.employmentContract.create({
    data: {
      employeeId: e2.id,
      salaryStructureId: structure.id,
      startDate: d,
      status: 'ACTIVE'
    }
  });

  await prisma.workingSchedule.create({
    data: {
      contractId: c2.id,
      days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      hours: 8,
    }
  });

  console.log('Seed completed successfully!');
  console.log('Demo Users Created:');
  console.log('1. Admin: admin@techcorp.com');
  console.log('2. HR Manager: hrmanager@techcorp.com');
  console.log('3. HR Payroll User: payrolluser@techcorp.com');
  console.log('4. HR Payroll Manager: payrollmgr@techcorp.com');
  console.log('5. Employee: employee@techcorp.com');
  console.log('Password for all users: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
