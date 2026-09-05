"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeOffService = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const client_1 = require("@prisma/client");
class TimeOffService {
    // --- Time Off Types ---
    static async getAllTypes() {
        return database_1.prisma.timeOffType.findMany({ orderBy: { name: 'asc' } });
    }
    static async createType(data) {
        const existing = await database_1.prisma.timeOffType.findUnique({ where: { name: data.name } });
        if (existing) {
            throw new apiResponse_1.AppError(`Time off type "${data.name}" already exists.`, 400, 'TYPE_EXISTS');
        }
        return database_1.prisma.timeOffType.create({ data });
    }
    // --- Allocations ---
    static async getAllAllocations(query) {
        const where = {};
        if (query.employeeId)
            where.employeeId = query.employeeId;
        if (query.status)
            where.status = query.status;
        return database_1.prisma.timeOffAllocation.findMany({
            where,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
                timeOffType: { select: { id: true, name: true, displayColor: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getAllocationById(id) {
        const allocation = await database_1.prisma.timeOffAllocation.findUnique({
            where: { id },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, jobPosition: true } },
                timeOffType: true,
            },
        });
        if (!allocation) {
            throw new apiResponse_1.AppError('Time off allocation record not found.', 404, 'ALLOCATION_NOT_FOUND');
        }
        return allocation;
    }
    static async createAllocation(data) {
        const allocated = parseFloat(data.allocatedDays);
        const allocation = await database_1.prisma.timeOffAllocation.create({
            data: {
                employeeId: data.employeeId,
                timeOffTypeId: data.timeOffTypeId,
                allocatedDays: allocated,
                takenDays: 0.0,
                remainingDays: allocated,
                validityYear: data.validityYear || new Date().getFullYear(),
                description: data.description,
                status: client_1.TimeOffAllocationStatus.APPROVED,
            },
            include: {
                employee: true,
                timeOffType: true,
            },
        });
        return allocation;
    }
    // --- Leave Requests ---
    static async getAllRequests(query) {
        const where = {};
        if (query.employeeId)
            where.employeeId = query.employeeId;
        if (query.status)
            where.status = query.status;
        return database_1.prisma.timeOffRequest.findMany({
            where,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, jobPosition: true } },
                timeOffType: { select: { id: true, name: true, displayColor: true, requiresAllocation: true } },
                allocation: { select: { id: true, remainingDays: true, description: true } },
            },
            orderBy: { startDate: 'desc' },
        });
    }
    static async getRequestById(id) {
        const request = await database_1.prisma.timeOffRequest.findUnique({
            where: { id },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, jobPosition: true } },
                timeOffType: true,
                allocation: true,
            },
        });
        if (!request) {
            throw new apiResponse_1.AppError('Time off request not found.', 404, 'REQUEST_NOT_FOUND');
        }
        return request;
    }
    static async createRequest(data) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (end < start) {
            throw new apiResponse_1.AppError('End date cannot be earlier than start date.', 400, 'INVALID_DATES');
        }
        const type = await database_1.prisma.timeOffType.findUnique({ where: { id: data.timeOffTypeId } });
        if (!type) {
            throw new apiResponse_1.AppError('Time off type not found.', 404, 'TYPE_NOT_FOUND');
        }
        // Calculate duration days
        const diffMs = end.getTime() - start.getTime();
        const durationDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);
        let allocationId = null;
        if (type.requiresAllocation) {
            // Find matching approved allocation for employee
            const allocation = await database_1.prisma.timeOffAllocation.findFirst({
                where: {
                    employeeId: data.employeeId,
                    timeOffTypeId: data.timeOffTypeId,
                    status: client_1.TimeOffAllocationStatus.APPROVED,
                    remainingDays: { gte: durationDays },
                },
            });
            if (!allocation) {
                throw new apiResponse_1.AppError(`Insufficient leave balance for ${type.name}. Required: ${durationDays} days.`, 400, 'INSUFFICIENT_BALANCE');
            }
            allocationId = allocation.id;
        }
        const request = await database_1.prisma.timeOffRequest.create({
            data: {
                employeeId: data.employeeId,
                timeOffTypeId: data.timeOffTypeId,
                allocationId,
                startDate: start,
                endDate: end,
                durationDays,
                reason: data.reason,
                status: client_1.TimeOffRequestStatus.TO_APPROVE,
            },
            include: {
                employee: true,
                timeOffType: true,
            },
        });
        return request;
    }
    static async approveRequest(requestId, approverName, approverEmployeeId, approverUserId) {
        const request = await database_1.prisma.timeOffRequest.findUnique({
            where: { id: requestId },
            include: { timeOffType: true, allocation: true, employee: true },
        });
        if (!request) {
            throw new apiResponse_1.AppError('Time off request not found.', 404, 'REQUEST_NOT_FOUND');
        }
        // Seniority Guard: Self-approval check
        if (approverEmployeeId && request.employeeId === approverEmployeeId) {
            throw new apiResponse_1.AppError('Seniority Guard: You cannot approve your own time off request.', 400, 'SELF_APPROVAL_FORBIDDEN');
        }
        if (request.status === client_1.TimeOffRequestStatus.APPROVED) {
            throw new apiResponse_1.AppError('Request is already approved.', 400, 'ALREADY_APPROVED');
        }
        // Use DB Transaction to atomically update request status and deduct allocation balance
        return database_1.prisma.$transaction(async (tx) => {
            if (request.timeOffType.requiresAllocation && request.allocationId) {
                const alloc = await tx.timeOffAllocation.findUnique({ where: { id: request.allocationId } });
                if (!alloc || alloc.remainingDays < request.durationDays) {
                    throw new apiResponse_1.AppError('Insufficient allocation balance to approve request.', 400, 'INSUFFICIENT_BALANCE');
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
                    status: client_1.TimeOffRequestStatus.APPROVED,
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
    static async refuseRequest(requestId, approverName) {
        const request = await database_1.prisma.timeOffRequest.findUnique({ where: { id: requestId } });
        if (!request) {
            throw new apiResponse_1.AppError('Time off request not found.', 404, 'REQUEST_NOT_FOUND');
        }
        const updated = await database_1.prisma.timeOffRequest.update({
            where: { id: requestId },
            data: {
                status: client_1.TimeOffRequestStatus.REFUSED,
                approverName,
            },
        });
        return updated;
    }
}
exports.TimeOffService = TimeOffService;
//# sourceMappingURL=timeOff.service.js.map