import { prisma } from '../../database/db';
import { CreateContractInput } from './contract.schema';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { Decimal } from 'decimal.js';

export class ContractService {
  async create(orgId: string, input: CreateContractInput) {
    // 1. Validate employee exists in org
    const employee = await prisma.employee.findFirst({
      where: { id: input.employeeId, orgId },
    });
    if (!employee) throw new NotFoundError('Employee not found');

    const startDate = new Date(input.startDate);
    const endDate = input.endDate ? new Date(input.endDate) : null;

    if (endDate && startDate >= endDate) {
      throw new ValidationError('Start date must be before end date');
    }

    // 2. Prevent overlapping active contracts
    const overlapping = await prisma.employmentContract.findFirst({
      where: {
        employeeId: input.employeeId,
        status: 'ACTIVE',
        OR: [
          { endDate: null }, // Existing contract has no end date
          { endDate: { gte: startDate } }, // Existing contract ends after new contract starts
        ],
      },
    });

    if (overlapping) {
      throw new ValidationError('An active contract already overlaps with the specified period', {
        overlappingId: overlapping.id,
      });
    }

    // 3. Create contract and schedule atomically
    return prisma.$transaction(async (tx) => {
      const contract = await tx.employmentContract.create({
        data: {
          employeeId: input.employeeId,
          salaryStructureId: input.salaryStructureId,
          startDate,
          endDate,
          status: input.status,
        },
      });

      const schedule = await tx.workingSchedule.create({
        data: {
          contractId: contract.id,
          days: input.workingSchedule.days,
          hours: new Decimal(input.workingSchedule.hours),
        },
      });

      return { contract, schedule };
    });
  }

  async getByEmployee(orgId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, orgId },
    });
    if (!employee) throw new NotFoundError('Employee not found');

    return prisma.employmentContract.findMany({
      where: { employeeId },
      include: { workingSchedules: true, salaryStructure: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async getAll(orgId: string) {
    const contracts = await prisma.employmentContract.findMany({
      where: { employee: { orgId } },
      include: {
        employee: true,
        salaryStructure: { include: { rules: true } },
        workingSchedules: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return contracts.map((c, i) => {
      const basicRule = c.salaryStructure?.rules?.find(r => r.code === 'BASIC');
      const monthlyWage = basicRule ? Number(basicRule.value) : 7500;
      return {
        id: c.id,
        contractReference: `CON/2026/${String(i + 1).padStart(4, '0')}`,
        startDate: c.startDate.toISOString().split('T')[0],
        endDate: c.endDate ? c.endDate.toISOString().split('T')[0] : null,
        status: c.status,
        monthlyWage,
        employeeId: c.employeeId,
        employee: {
          id: c.employee.id,
          firstName: c.employee.firstName,
          lastName: c.employee.lastName,
          employeeCode: `EMP-${String(i + 1).padStart(3, '0')}`,
        },
        salaryStructureId: c.salaryStructureId,
        salaryStructure: c.salaryStructure ? {
          id: c.salaryStructure.id,
          name: c.salaryStructure.name,
          code: c.salaryStructure.name.split(' ')[0].toUpperCase(),
        } : null,
        workingSchedule: c.workingSchedules[0] ? {
          days: c.workingSchedules[0].days,
          hours: Number(c.workingSchedules[0].hours),
        } : null,
      };
    });
  }
}
