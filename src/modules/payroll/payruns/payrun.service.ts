import { prisma } from '../../../database/db';
import { CreatePayrunInput } from './payrun.schema';
import { NotFoundError, ValidationError } from '../../../shared/errors';
import { logAudit } from '../../../shared/audit';

export class PayrunService {
  async initialize(orgId: string, input: CreatePayrunInput, createdBy: string) {
    const periodStart = new Date(input.periodStart);
    const periodEnd = new Date(input.periodEnd);

    if (periodStart >= periodEnd) {
      throw new ValidationError('Period start must be before period end');
    }

    // Ensure we don't have overlapping payruns in DRAFT/CALCULATING states for safety
    // For this hackathon, we allow multiple but it's risky. Let's just create it.

    return prisma.$transaction(async (tx) => {
      // 1. Create the base Payrun record
      const payrun = await tx.payrun.create({
        data: {
          orgId,
          periodStart,
          periodEnd,
          status: 'DRAFT',
          createdBy,
        },
      });

      // 2. Find all eligible contracts for this period
      // A contract is eligible if it overlaps with the payrun period
      // (startDate <= periodEnd) AND (endDate is null OR endDate >= periodStart)
      const eligibleContracts = await tx.employmentContract.findMany({
        where: {
          employee: { orgId },
          status: 'ACTIVE',
          startDate: { lte: periodEnd },
          OR: [
            { endDate: null },
            { endDate: { gte: periodStart } }
          ],
        },
        include: { employee: true },
      });

      if (eligibleContracts.length === 0) {
        throw new ValidationError('No eligible active contracts found for this period');
      }

      // 3. Lock employees into this payrun (snapshotting structure)
      const payrunEmployeesData = eligibleContracts.map((contract) => ({
        payrunId: payrun.id,
        employeeId: contract.employeeId,
        contractId: contract.id,
        structureId: contract.salaryStructureId,
        status: 'DRAFT', // using generic string for now, mapped in schema
      }));

      await tx.payrunEmployee.createMany({
        data: payrunEmployeesData,
      });

      return tx.payrun.findUnique({
        where: { id: payrun.id },
        include: { _count: { select: { employees: true } } },
      });
    });
  }

  async getById(orgId: string, id: string) {
    const payrun = await prisma.payrun.findFirst({
      where: { id, orgId },
      include: {
        employees: {
          include: { employee: true, contract: true }
        }
      },
    });

    if (!payrun) throw new NotFoundError('Payrun not found');
    return payrun;
  }

  async getAll(orgId: string) {
    return prisma.payrun.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { employees: true } } },
    });
  }

  async submitForApproval(orgId: string, id: string) {
    const payrun = await this.getById(orgId, id);
    if (payrun.status !== 'VALIDATING') {
      throw new ValidationError(`Cannot submit payrun in ${payrun.status} state. Expected VALIDATING.`);
    }
    return prisma.payrun.update({
      where: { id },
      data: { status: 'READY_FOR_APPROVAL' },
    });
  }

  async approve(orgId: string, id: string, approvedBy: string) {
    const payrun = await this.getById(orgId, id);
    if (payrun.status !== 'READY_FOR_APPROVAL') {
      throw new ValidationError(`Cannot approve payrun in ${payrun.status} state. Expected READY_FOR_APPROVAL.`);
    }
    const updated = await prisma.payrun.update({
      where: { id },
      data: { status: 'APPROVED', approvedBy },
    });
    
    await logAudit({
      orgId,
      userId: approvedBy,
      action: 'APPROVE_PAYRUN',
      entity: 'Payrun',
      entityId: id,
    });
    
    return updated;
  }

  async reject(orgId: string, id: string) {
    const payrun = await this.getById(orgId, id);
    if (payrun.status !== 'READY_FOR_APPROVAL') {
      throw new ValidationError(`Cannot reject payrun in ${payrun.status} state. Expected READY_FOR_APPROVAL.`);
    }
    // Rejecting sends it back to DRAFT so it can be recalculated
    return prisma.payrun.update({
      where: { id },
      data: { status: 'DRAFT' },
    });
  }

  async finalize(orgId: string, id: string) {
    const payrun = await this.getById(orgId, id);
    if (payrun.status !== 'APPROVED') {
      throw new ValidationError(`Cannot finalize payrun in ${payrun.status} state. Expected APPROVED.`);
    }

    // Atomic finalization of Payrun and all associated Payslips
    return prisma.$transaction(async (tx) => {
      const finalized = await tx.payrun.update({
        where: { id },
        data: { status: 'FINALIZED' },
      });

      await tx.payslip.updateMany({
        where: { 
          payrunId: id,
          status: 'DRAFT'
        },
        data: { status: 'FINALIZED' }
      });

      await logAudit({
        orgId,
        userId: 'SYSTEM', // or pass through the acting user
        action: 'FINALIZE_PAYRUN',
        entity: 'Payrun',
        entityId: id,
      });

      return finalized;
    });
  }
}
