import { prisma } from '../../database/db';
import { RequestTimeOffInput } from './timeoff.schema';
import { NotFoundError, ValidationError, InvalidStateTransitionError } from '../../shared/errors';
import { Decimal } from 'decimal.js';

export class TimeOffService {
  async requestTimeOff(orgId: string, input: RequestTimeOffInput) {
    if (!input.employeeId) throw new ValidationError('Employee profile is required to request time off');
    const employee = await prisma.employee.findFirst({
      where: { id: input.employeeId, orgId },
    });
    if (!employee) throw new NotFoundError('Employee not found');

    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    const startDay = startDate.toISOString().slice(0, 10);
    const endDay = endDate.toISOString().slice(0, 10);
    const todayDay = new Date().toISOString().slice(0, 10);

    if (startDate > endDate) {
      throw new ValidationError('Start date must be before or equal to end date');
    }

    if (startDay === endDay) {
      throw new ValidationError('Same-day leave requests are not allowed; select a start and end date on different days');
    }

    if (startDay <= todayDay) {
      throw new ValidationError('Leave cannot start today or in the past');
    }

    // A simple calculation for days (ignoring weekends for this hackathon version)
    const daysRequested = new Decimal((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1);

    // Validate allocation
    let allocation = await prisma.timeOffAllocation.findUnique({
      where: {
        employeeId_typeId: {
          employeeId: input.employeeId,
          typeId: input.typeId,
        },
      },
    });

    if (!allocation) {
      const typeCode = input.typeId.toUpperCase();
      const typeName = typeCode === 'ANNUAL' ? 'Annual Leave'
        : typeCode === 'SICK' ? 'Sick Leave'
        : typeCode === 'CASUAL' ? 'Casual Leave'
        : typeCode === 'PARENTAL' ? 'Parental Leave'
        : typeCode === 'UNPAID' ? 'Unpaid Leave'
        : input.typeId;
      const type = await prisma.timeOffType.findFirst({ where: { orgId, name: typeName } });
      if (type) {
        allocation = await prisma.timeOffAllocation.findUnique({
          where: { employeeId_typeId: { employeeId: input.employeeId, typeId: type.id } },
        });
      }
    }

    if (!allocation) {
      throw new ValidationError('No time off allocation found for this type');
    }

    const available = new Decimal(allocation.totalDays).minus(allocation.usedDays);
    if (available.lessThan(daysRequested)) {
      throw new ValidationError('Insufficient time off balance');
    }

    return prisma.timeOffRequest.create({
      data: {
        employeeId: input.employeeId,
        typeId: allocation.typeId,
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

  async getAllRequests(orgId: string, status?: string, employeeId?: string) {
    const where: any = { employee: { orgId } };
    if (employeeId) where.employeeId = employeeId;
    if (status) {
      where.status = status;
    }
    const requests = await prisma.timeOffRequest.findMany({
      where,
      include: {
        employee: true,
        timeOffType: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => {
      const diffMs = new Date(r.endDate).getTime() - new Date(r.startDate).getTime();
      const durationDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
      return {
        id: r.id,
        employeeId: r.employeeId,
        timeOffTypeId: r.typeId,
        startDate: r.startDate.toISOString().split('T')[0],
        endDate: r.endDate.toISOString().split('T')[0],
        durationDays,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        employee: {
          id: r.employee.id,
          firstName: r.employee.firstName,
          lastName: r.employee.lastName,
          employeeCode: `EMP-${r.employee.firstName[0]}${r.employee.lastName[0]}`,
        },
        timeOffType: {
          id: r.timeOffType.id,
          name: r.timeOffType.name,
          isPaid: r.timeOffType.isPaid,
        },
      };
    });
  }

  async getAllTypes(orgId: string) {
    return prisma.timeOffType.findMany({
      where: { orgId },
      orderBy: { name: 'asc' },
    });
  }

  async getAllAllocations(orgId: string, employeeId?: string) {
    const where: any = { employee: { orgId } };
    if (employeeId) where.employeeId = employeeId;

    return prisma.timeOffAllocation.findMany({
      where,
      include: {
        employee: true,
        timeOffType: true,
      },
      orderBy: [
        { employee: { firstName: 'asc' } },
        { timeOffType: { name: 'asc' } },
      ],
    });
  }
}
