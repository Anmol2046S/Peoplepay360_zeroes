import { prisma } from '../config/database';
import { AppError } from '../utils/apiResponse';
import { TimeOffAllocationStatus, TimeOffRequestStatus } from '@prisma/client';

export class TimeOffService {
  // --- Time Off Types ---
  static async getAllTypes() {
    return prisma.timeOffType.findMany({ orderBy: { name: 'asc' } });
  }

  static async createType(data: any) {
    const existing = await prisma.timeOffType.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new AppError(`Time off type "${data.name}" already exists.`, 400, 'TYPE_EXISTS');
    }
    return prisma.timeOffType.create({ data });
  }

  // --- Allocations ---
  static async getAllAllocations(query: { employeeId?: string; status?: TimeOffAllocationStatus }) {
    const where: any = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status) where.status = query.status;

    return prisma.timeOffAllocation.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        timeOffType: { select: { id: true, name: true, displayColor: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createAllocation(data: { employeeId: string; timeOffTypeId: string; allocatedDays: number; description?: string; validityYear?: number }) {
    const allocated = parseFloat(data.allocatedDays as any);

    const allocation = await prisma.timeOffAllocation.create({
      data: {
        employeeId: data.employeeId,
        timeOffTypeId: data.timeOffTypeId,
        allocatedDays: allocated,
        takenDays: 0.0,
        remainingDays: allocated,
        validityYear: data.validityYear || new Date().getFullYear(),
        description: data.description,
        status: TimeOffAllocationStatus.APPROVED,
      },
      include: {
        employee: true,
        timeOffType: true,
      },
    });

    return allocation;
  }

  // --- Leave Requests ---
  static async getAllRequests(query: { employeeId?: string; status?: TimeOffRequestStatus }) {
    const where: any = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status) where.status = query.status;

    return prisma.timeOffRequest.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, jobPosition: true } },
        timeOffType: { select: { id: true, name: true, displayColor: true, requiresAllocation: true } },
        allocation: { select: { id: true, remainingDays: true, description: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  static async createRequest(data: { employeeId: string; timeOffTypeId: string; startDate: string; endDate: string; reason?: string }) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end < start) {
      throw new AppError('End date cannot be earlier than start date.', 400, 'INVALID_DATES');
    }

    const type = await prisma.timeOffType.findUnique({ where: { id: data.timeOffTypeId } });
    if (!type) {
      throw new AppError('Time off type not found.', 404, 'TYPE_NOT_FOUND');
    }

    // Calculate duration days
    const diffMs = end.getTime() - start.getTime();
    const durationDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);

    let allocationId: string | null = null;

    if (type.requiresAllocation) {
      // Find matching approved allocation for employee
      const allocation = await prisma.timeOffAllocation.findFirst({
        where: {
          employeeId: data.employeeId,
          timeOffTypeId: data.timeOffTypeId,
          status: TimeOffAllocationStatus.APPROVED,
          remainingDays: { gte: durationDays },
        },
      });

      if (!allocation) {
        throw new AppError(`Insufficient leave balance for ${type.name}. Required: ${durationDays} days.`, 400, 'INSUFFICIENT_BALANCE');
      }

      allocationId = allocation.id;
    }

    const request = await prisma.timeOffRequest.create({
      data: {
        employeeId: data.employeeId,
        timeOffTypeId: data.timeOffTypeId,
        allocationId,
        startDate: start,
        endDate: end,
        durationDays,
        reason: data.reason,
        status: TimeOffRequestStatus.TO_APPROVE,
      },
      include: {
        employee: true,
        timeOffType: true,
      },
    });

    return request;
  }

  static async approveRequest(requestId: string, approverName: string, approverEmployeeId?: string | null, approverUserId?: string | null) {
    const request = await prisma.timeOffRequest.findUnique({
      where: { id: requestId },
      include: { timeOffType: true, allocation: true, employee: true },
    });

    if (!request) {
      throw new AppError('Time off request not found.', 404, 'REQUEST_NOT_FOUND');
    }

    // Seniority Guard: Self-approval check
    if (approverEmployeeId && request.employeeId === approverEmployeeId) {
      throw new AppError('Seniority Guard: You cannot approve your own time off request.', 400, 'SELF_APPROVAL_FORBIDDEN');
    }

    if (request.status === TimeOffRequestStatus.APPROVED) {
      throw new AppError('Request is already approved.', 400, 'ALREADY_APPROVED');
    }

    // Use DB Transaction to atomically update request status and deduct allocation balance
    return prisma.$transaction(async (tx) => {
      if (request.timeOffType.requiresAllocation && request.allocationId) {
        const alloc = await tx.timeOffAllocation.findUnique({ where: { id: request.allocationId } });
        if (!alloc || alloc.remainingDays < request.durationDays) {
          throw new AppError('Insufficient allocation balance to approve request.', 400, 'INSUFFICIENT_BALANCE');
        }

        const newTaken = alloc.takenDays + request.durationDays;
        const newRemaining = Math.max(0, alloc.allocatedDays - newTaken);

        await tx.timeOffAllocation.update({
          where: { id: alloc.id },
          data: {
            takenDays: newTaken,
            remainingDays: newRemaining,
          },
        });
      }

      const updated = await tx.timeOffRequest.update({
        where: { id: requestId },
        data: {
          status: TimeOffRequestStatus.APPROVED,
          approverName,
        },
        include: {
          employee: true,
          timeOffType: true,
          allocation: true,
        },
      });

      return updated;
    });
  }

  static async refuseRequest(requestId: string, approverName: string) {
    const request = await prisma.timeOffRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new AppError('Time off request not found.', 404, 'REQUEST_NOT_FOUND');
    }

    const updated = await prisma.timeOffRequest.update({
      where: { id: requestId },
      data: {
        status: TimeOffRequestStatus.REFUSED,
        approverName,
      },
    });

    return updated;
  }
}
