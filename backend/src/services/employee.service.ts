import { prisma } from '../config/database';
import { AppError } from '../utils/apiResponse';
import { AccountStatus } from '@prisma/client';

export class EmployeeService {
  static async getAllEmployees(query: { search?: string; departmentId?: string; status?: AccountStatus; view?: 'kanban' | 'list' }) {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { workEmail: { contains: query.search, mode: 'insensitive' } },
        { employeeCode: { contains: query.search, mode: 'insensitive' } },
        { jobPosition: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, code: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        workingSchedule: { select: { id: true, name: true, hoursPerWeek: true } },
        _count: {
          select: {
            contracts: true,
            attendances: true,
            leaveRequests: true,
            allocations: true,
            payslips: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return employees.map(emp => ({
      ...emp,
      smartCounts: {
        contracts: emp._count.contracts,
        attendance: emp._count.attendances,
        timeOff: emp._count.leaveRequests,
        allocations: emp._count.allocations,
        payslips: emp._count.payslips,
      },
    }));
  }

  static async getEmployeeById(id: string) {
    const emp = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        manager: { select: { id: true, firstName: true, lastName: true, workEmail: true } },
        workingSchedule: { include: { days: true } },
        user: { select: { id: true, email: true, role: true, status: true } },
        contracts: { orderBy: { startDate: 'desc' } },
        _count: {
          select: {
            contracts: true,
            attendances: true,
            leaveRequests: true,
            allocations: true,
            payslips: true,
          },
        },
      },
    });

    if (!emp) {
      throw new AppError(`Employee with ID ${id} not found.`, 404, 'EMPLOYEE_NOT_FOUND');
    }

    return {
      ...emp,
      smartCounts: {
        contracts: emp._count.contracts,
        attendance: emp._count.attendances,
        timeOff: emp._count.leaveRequests,
        allocations: emp._count.allocations,
        payslips: emp._count.payslips,
      },
    };
  }

  static async createEmployee(data: any) {
    const existingCode = await prisma.employee.findUnique({ where: { employeeCode: data.employeeCode } });
    if (existingCode) {
      throw new AppError(`Employee code ${data.employeeCode} already exists.`, 400, 'CODE_EXISTS');
    }

    const existingEmail = await prisma.employee.findUnique({ where: { workEmail: data.workEmail } });
    if (existingEmail) {
      throw new AppError(`Work email ${data.workEmail} already exists.`, 400, 'EMAIL_EXISTS');
    }

    const newEmp = await prisma.employee.create({
      data: {
        employeeCode: data.employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        workEmail: data.workEmail,
        workPhone: data.workPhone,
        jobPosition: data.jobPosition,
        status: data.status || AccountStatus.ACTIVE,
        workLocation: data.workLocation || 'Mumbai',
        bankAccountNumber: data.bankAccountNumber,
        bankName: data.bankName,
        ifscCode: data.ifscCode,
        departmentId: data.departmentId,
        managerId: data.managerId || null,
        workingScheduleId: data.workingScheduleId || null,
      },
      include: {
        department: true,
        manager: true,
        workingSchedule: true,
      },
    });

    return newEmp;
  }

  static async updateEmployee(id: string, data: any) {
    const emp = await prisma.employee.findUnique({ where: { id } });
    if (!emp) {
      throw new AppError(`Employee with ID ${id} not found.`, 404, 'EMPLOYEE_NOT_FOUND');
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        firstName: data.firstName !== undefined ? data.firstName : emp.firstName,
        lastName: data.lastName !== undefined ? data.lastName : emp.lastName,
        workEmail: data.workEmail !== undefined ? data.workEmail : emp.workEmail,
        workPhone: data.workPhone !== undefined ? data.workPhone : emp.workPhone,
        jobPosition: data.jobPosition !== undefined ? data.jobPosition : emp.jobPosition,
        status: data.status !== undefined ? data.status : emp.status,
        workLocation: data.workLocation !== undefined ? data.workLocation : emp.workLocation,
        bankAccountNumber: data.bankAccountNumber !== undefined ? data.bankAccountNumber : emp.bankAccountNumber,
        bankName: data.bankName !== undefined ? data.bankName : emp.bankName,
        ifscCode: data.ifscCode !== undefined ? data.ifscCode : emp.ifscCode,
        departmentId: data.departmentId !== undefined ? data.departmentId : emp.departmentId,
        managerId: data.managerId !== undefined ? data.managerId : emp.managerId,
        workingScheduleId: data.workingScheduleId !== undefined ? data.workingScheduleId : emp.workingScheduleId,
      },
      include: {
        department: true,
        manager: true,
        workingSchedule: true,
      },
    });

    return updated;
  }
}
