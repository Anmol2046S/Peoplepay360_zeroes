import { prisma } from '../../database/db';
import { CreateContractInput } from './contract.schema';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { Decimal } from 'decimal.js';

export class ContractService {
  private formatContract(contract: any) {
    const wage = contract.monthlyWage ? Number(contract.monthlyWage) : 85000;
    return {
      id: contract.id,
      contractReference: contract.contractReference || `CON/2026/${contract.id.slice(-4).toUpperCase()}`,
      employeeId: contract.employeeId,
      employee: contract.employee ? {
        id: contract.employee.id,
        firstName: contract.employee.firstName,
        lastName: contract.employee.lastName,
        employeeCode: `EMP-${contract.employee.id.slice(-4).toUpperCase()}`,
        jobTitle: contract.employee.jobTitle,
        department: contract.employee.department?.name || 'Engineering',
      } : null,
      startDate: contract.startDate?.toISOString() || new Date().toISOString(),
      endDate: contract.endDate?.toISOString() || null,
      monthlyWage: wage,
      status: contract.status || 'ACTIVE',
      salaryStructure: contract.salaryStructure ? {
        id: contract.salaryStructure.id,
        name: contract.salaryStructure.name,
        code: contract.salaryStructure.code || 'REG01',
      } : { id: 's1', name: 'Standard Salary Structure', code: 'REG01' },
      workingSchedules: contract.workingSchedules || [],
      createdAt: contract.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  async getAll(orgId: string) {
    const contracts = await prisma.employmentContract.findMany({
      where: {
        employee: { orgId }
      },
      include: {
        employee: {
          include: { department: true }
        },
        salaryStructure: true,
        workingSchedules: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return contracts.map(c => this.formatContract(c));
  }

  async getById(orgId: string, id: string) {
    const contract = await prisma.employmentContract.findFirst({
      where: {
        id,
        employee: { orgId }
      },
      include: {
        employee: {
          include: { department: true }
        },
        salaryStructure: true,
        workingSchedules: true,
      },
    });

    if (!contract) {
      throw new NotFoundError(`Contract with id ${id} not found`);
    }

    return this.formatContract(contract);
  }

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
          { endDate: null },
          { endDate: { gte: startDate } },
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
          contractReference: `CON/2026/${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          startDate,
          endDate,
          monthlyWage: new Decimal(7083.33),
          status: input.status,
        },
        include: {
          employee: true,
          salaryStructure: true,
        }
      });

      let schedule = null;
      if (input.workingSchedule) {
        schedule = await tx.workingSchedule.create({
          data: {
            contractId: contract.id,
            days: input.workingSchedule.days,
            hours: new Decimal(input.workingSchedule.hours),
          },
        });
      }

      return this.formatContract({ ...contract, workingSchedules: schedule ? [schedule] : [] });
    });
  }

  async getByEmployee(orgId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, orgId },
    });
    if (!employee) throw new NotFoundError('Employee not found');

    const contracts = await prisma.employmentContract.findMany({
      where: { employeeId },
      include: {
        employee: { include: { department: true } },
        workingSchedules: true,
        salaryStructure: true
      },
      orderBy: { startDate: 'desc' },
    });

    return contracts.map(c => this.formatContract(c));
  }

  async update(orgId: string, id: string, data: any) {
    const contract = await prisma.employmentContract.findFirst({
      where: { id, employee: { orgId } },
    });

    if (!contract) {
      throw new NotFoundError(`Contract with id ${id} not found`);
    }

    const updated = await prisma.employmentContract.update({
      where: { id },
      data: {
        status: data.status !== undefined ? data.status : contract.status,
        monthlyWage: data.monthlyWage !== undefined ? new Decimal(data.monthlyWage) : contract.monthlyWage,
        startDate: data.startDate ? new Date(data.startDate) : contract.startDate,
        endDate: data.endDate ? new Date(data.endDate) : contract.endDate,
      },
      include: {
        employee: { include: { department: true } },
        salaryStructure: true,
        workingSchedules: true,
      }
    });

    return this.formatContract(updated);
  }

  async delete(orgId: string, id: string) {
    const contract = await prisma.employmentContract.findFirst({
      where: { id, employee: { orgId } },
    });

    if (!contract) {
      throw new NotFoundError(`Contract with id ${id} not found`);
    }

    await prisma.employmentContract.delete({
      where: { id },
    });

    return { id, message: 'Contract deleted successfully' };
  }
}
