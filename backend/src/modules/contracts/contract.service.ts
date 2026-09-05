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
}
