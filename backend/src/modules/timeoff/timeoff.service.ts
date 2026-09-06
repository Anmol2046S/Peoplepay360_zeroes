import { prisma } from '../../database/db';
import { RequestTimeOffInput } from './timeoff.schema';
import { NotFoundError, ValidationError, InvalidStateTransitionError } from '../../shared/errors';
import { Decimal } from 'decimal.js';

export class TimeOffService {
  async getRequests(orgId: string, query?: { status?: string; employeeId?: string }) {
    const where: any = {
      employee: { orgId }
    };
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.employeeId) {
      where.OR = [
        { employeeId: query.employeeId },
        { employee: { userId: query.employeeId } }
      ];
    }
    return prisma.timeOffRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            user: {
              select: {
                email: true,
              }
            },
            department: {
              select: {
                name: true,
              }
            }
          }
        },
        timeOffType: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTypes(orgId: string) {
    let types = await prisma.timeOffType.findMany({
      where: { orgId }
    });

    if (types.length === 0) {
      await prisma.timeOffType.createMany({
        data: [
          { orgId, name: 'Paid Time Off', isPaid: true, displayColor: '#4F46E5' },
          { orgId, name: 'Sick Leave', isPaid: true, displayColor: '#EF4444' },
          { orgId, name: 'Casual Leave', isPaid: true, displayColor: '#F59E0B' },
          { orgId, name: 'Unpaid Leave', isPaid: false, displayColor: '#6B7280' },
        ]
      });
      types = await prisma.timeOffType.findMany({ where: { orgId } });
    }

    return types;
  }

  async getAllocations(orgId: string, employeeId?: string) {
    const where: any = {
      employee: { orgId }
    };
    if (employeeId) {
      where.OR = [
        { employeeId },
        { employee: { userId: employeeId } }
      ];
    }
    return prisma.timeOffAllocation.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            user: {
              select: {
                email: true,
              }
            }
          }
        },
        timeOffType: true
      }
    });
  }

  async createAllocation(orgId: string, data: any) {
    const employee = await prisma.employee.findFirst({
      where: {
        orgId,
        OR: [
          { id: data.employeeId },
          { userId: data.employeeId }
        ]
      }
    });
    if (!employee) throw new NotFoundError('Employee not found');

    const total = new Decimal(data.totalDays || data.allocatedDays || 20);
    const used = new Decimal(data.usedDays || data.takenDays || 0);
    const remaining = total.minus(used);

    const allocation = await prisma.timeOffAllocation.upsert({
      where: {
        employeeId_typeId: {
          employeeId: employee.id,
          typeId: data.typeId,
        }
      },
      update: {
        totalDays: total,
        usedDays: used,
        remainingDays: remaining,
      },
      create: {
        employeeId: employee.id,
        typeId: data.typeId,
        totalDays: total,
        usedDays: used,
        remainingDays: remaining,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        timeOffType: true,
      }
    });

    return allocation;
  }

  async updateAllocation(orgId: string, id: string, data: any) {
    const existing = await prisma.timeOffAllocation.findFirst({
      where: { id, employee: { orgId } }
    });
    if (!existing) throw new NotFoundError('Allocation record not found');

    const total = data.totalDays !== undefined ? new Decimal(data.totalDays) : existing.totalDays;
    const used = data.usedDays !== undefined ? new Decimal(data.usedDays) : existing.usedDays;
    const remaining = total.minus(used);

    return prisma.timeOffAllocation.update({
      where: { id },
      data: {
        totalDays: total,
        usedDays: used,
        remainingDays: remaining,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        timeOffType: true,
      }
    });
  }

  async deleteAllocation(orgId: string, id: string) {
    const existing = await prisma.timeOffAllocation.findFirst({
      where: { id, employee: { orgId } }
    });
    if (!existing) throw new NotFoundError('Allocation record not found');

    await prisma.timeOffAllocation.delete({
      where: { id }
    });
    return { id, message: 'Allocation deleted successfully' };
  }

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

    // A simple calculation for days
    const daysRequested = new Decimal((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1);

    // Validate allocation or create default
    let allocation = await prisma.timeOffAllocation.findUnique({
      where: {
        employeeId_typeId: {
          employeeId: employee.id,
          typeId: input.typeId,
        },
      },
    });

    if (!allocation) {
      allocation = await prisma.timeOffAllocation.create({
        data: {
          employeeId: employee.id,
          typeId: input.typeId,
          totalDays: new Decimal(20),
          usedDays: new Decimal(0),
          remainingDays: new Decimal(20),
        }
      });
    }

    const available = new Decimal(allocation.totalDays).minus(allocation.usedDays);
    if (available.lessThan(daysRequested)) {
      throw new ValidationError('Insufficient time off balance');
    }

    return prisma.timeOffRequest.create({
      data: {
        employeeId: employee.id,
        typeId: input.typeId,
        allocationId: allocation.id,
        startDate,
        endDate,
        durationDays: daysRequested,
        reason: input.reason,
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
      let allocation = await tx.timeOffAllocation.findUnique({
        where: {
          employeeId_typeId: {
            employeeId: request.employeeId,
            typeId: request.typeId,
          },
        },
      });

      if (!allocation) {
        allocation = await tx.timeOffAllocation.create({
          data: {
            employeeId: request.employeeId,
            typeId: request.typeId,
            totalDays: new Decimal(20),
            usedDays: new Decimal(0),
            remainingDays: new Decimal(20),
          }
        });
      }

      const available = new Decimal(allocation.totalDays).minus(allocation.usedDays);
      if (available.lessThan(daysRequested)) {
        throw new ValidationError('Insufficient time off balance for approval');
      }

      await tx.timeOffAllocation.update({
        where: { id: allocation.id },
        data: {
          usedDays: new Decimal(allocation.usedDays).plus(daysRequested),
          remainingDays: new Decimal(allocation.totalDays).minus(new Decimal(allocation.usedDays).plus(daysRequested)),
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
