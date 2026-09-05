import { prisma } from '../config/database';
import { AppError } from '../utils/apiResponse';
import { ContractStatus } from '@prisma/client';

export class ContractService {
  static async getAllContracts(query: { employeeId?: string; status?: ContractStatus }) {
    const where: any = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status) where.status = query.status;

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, jobPosition: true } },
        department: { select: { id: true, name: true } },
        salaryStructure: { select: { id: true, name: true } },
        workingSchedule: { select: { id: true, name: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    return contracts;
  }

  static async getContractById(id: string) {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        employee: true,
        department: true,
        salaryStructure: { include: { rules: true } },
        workingSchedule: { include: { days: true } },
      },
    });

    if (!contract) {
      throw new AppError(`Contract with ID ${id} not found.`, 404, 'CONTRACT_NOT_FOUND');
    }

    return contract;
  }

  static async createContract(data: any) {
    // Check reference unique
    const existing = await prisma.contract.findUnique({ where: { contractReference: data.contractReference } });
    if (existing) {
      throw new AppError(`Contract reference ${data.contractReference} already exists.`, 400, 'REFERENCE_EXISTS');
    }

    const newContract = await prisma.contract.create({
      data: {
        contractReference: data.contractReference,
        employeeId: data.employeeId,
        departmentId: data.departmentId,
        workingScheduleId: data.workingScheduleId,
        salaryStructureId: data.salaryStructureId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        monthlyWage: parseFloat(data.monthlyWage),
        status: data.status || ContractStatus.DRAFT,
        notes: data.notes,
      },
      include: {
        employee: true,
        salaryStructure: true,
      },
    });

    return newContract;
  }

  /**
   * Resolves exactly ONE active RUNNING contract for an employee during a given payroll period.
   * Throws NO_ACTIVE_CONTRACT if 0 found, or CONTRACT_CONFLICT if >1 overlapping running contracts found.
   */
  static async resolveActiveContract(employeeId: string, periodStart: Date, periodEnd: Date) {
    const runningContracts = await prisma.contract.findMany({
      where: {
        employeeId,
        status: ContractStatus.RUNNING,
        startDate: { lte: periodEnd },
        OR: [
          { endDate: null },
          { endDate: { gte: periodStart } },
        ],
      },
      include: {
        salaryStructure: { include: { rules: true } },
      },
    });

    if (runningContracts.length === 0) {
      throw new AppError(`No active RUNNING contract found for employee ${employeeId} in the selected period.`, 400, 'NO_ACTIVE_CONTRACT');
    }

    if (runningContracts.length > 1) {
      throw new AppError(`Conflict: Employee ${employeeId} has ${runningContracts.length} overlapping RUNNING contracts for the selected period.`, 400, 'CONTRACT_CONFLICT');
    }

    return runningContracts[0];
  }
}
