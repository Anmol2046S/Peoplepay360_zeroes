import { prisma } from '../../database/db';
import { RequestTimeOffInput } from './timeoff.schema';
import { NotFoundError, ValidationError, InvalidStateTransitionError } from '../../shared/errors';
import { Decimal } from 'decimal.js';

export class TimeOffService {
  async requestTimeOff(orgId: string, input: RequestTimeOffInput) {
    const employee = await prisma.employee.findFirst({
      where: { 
        orgId,
        OR: [
          { id: input.employeeId },
          { userId: input.employeeId }
        ]
      },
    });
    if (!employee) throw new NotFoundError('Employee not found');

    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    if (startDate > endDate) {
      throw new ValidationError('Start date must be before or equal to end date');
    }

    // A simple calculation for days (ignoring weekends for this hackathon version)
    const daysRequested = new Decimal((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1);

    // Validate allocation
    const allocation = await prisma.timeOffAllocation.findUnique({
      where: {
        employeeId_typeId: {
          employeeId: employee.id,
          typeId: input.typeId,
        },
      },
    });

    if (!allocation) {
      throw new ValidationError('No time off allocation found for this type');
    }

    const available = new Decimal(allocation.totalDays).minus(allocation.usedDays);
    if (available.lessThan(daysRequested)) {
      throw new ValidationError('Insufficient time off balance');
    }

    return prisma.timeOffRequest.create({
      data: {
        employeeId: employee.id,
        typeId: input.typeId,
        startDate,
        endDate,
        status: 'PENDING',
      },
    });
  }

  async approve(orgId: string, id: string) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.timeOffRequest.findUnique({
        where: { id },
        include: { employee: true },
      });

      if (!request || request.employee.orgId !== orgId) {
        throw new NotFoundError('Time off request not found');
      }

      if (request.status !== 'PENDING') {
        throw new InvalidStateTransitionError(`Cannot approve request in ${request.status} state`);
      }

      const daysRequested = new Decimal((request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24) + 1);

      // Deduct balance atomically
      const allocation = await tx.timeOffAllocation.findUnique({
        where: {
          employeeId_typeId: {
            employeeId: request.employeeId,
            typeId: request.typeId,
          },
        },
      });

      if (!allocation) throw new ValidationError('Allocation not found');

      const available = new Decimal(allocation.totalDays).minus(allocation.usedDays);
      if (available.lessThan(daysRequested)) {
        throw new ValidationError('Insufficient time off balance for approval');
      }

      await tx.timeOffAllocation.update({
        where: { id: allocation.id },
        data: {
          usedDays: new Decimal(allocation.usedDays).plus(daysRequested),
        },
      });

      return tx.timeOffRequest.update({
        where: { id },
        data: { status: 'APPROVED' },
      });
    });
  }

  async reject(orgId: string, id: string) {
    const request = await prisma.timeOffRequest.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!request || request.employee.orgId !== orgId) {
      throw new NotFoundError('Time off request not found');
    }

    if (request.status !== 'PENDING') {
      throw new InvalidStateTransitionError(`Cannot reject request in ${request.status} state`);
    }

    return prisma.timeOffRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }
}
