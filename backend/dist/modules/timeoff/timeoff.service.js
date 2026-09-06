"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeOffService = void 0;
const db_1 = require("../../database/db");
const errors_1 = require("../../shared/errors");
const decimal_js_1 = require("decimal.js");
class TimeOffService {
    async getRequests(orgId, query) {
        const where = {
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
        return db_1.prisma.timeOffRequest.findMany({
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
    async getTypes(orgId) {
        let types = await db_1.prisma.timeOffType.findMany({
            where: { orgId }
        });
        if (types.length === 0) {
            await db_1.prisma.timeOffType.createMany({
                data: [
                    { orgId, name: 'Paid Time Off', isPaid: true, displayColor: '#4F46E5' },
                    { orgId, name: 'Sick Leave', isPaid: true, displayColor: '#EF4444' },
                    { orgId, name: 'Casual Leave', isPaid: true, displayColor: '#F59E0B' },
                    { orgId, name: 'Unpaid Leave', isPaid: false, displayColor: '#6B7280' },
                ]
            });
            types = await db_1.prisma.timeOffType.findMany({ where: { orgId } });
        }
        return types;
    }
    async getAllocations(orgId, employeeId) {
        const where = {
            employee: { orgId }
        };
        if (employeeId) {
            where.OR = [
                { employeeId },
                { employee: { userId: employeeId } }
            ];
        }
        return db_1.prisma.timeOffAllocation.findMany({
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
    async requestTimeOff(orgId, input) {
        const employee = await db_1.prisma.employee.findFirst({
            where: {
                orgId,
                OR: [
                    { id: input.employeeId },
                    { userId: input.employeeId }
                ]
            },
        });
        if (!employee)
            throw new errors_1.NotFoundError('Employee not found');
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        if (startDate > endDate) {
            throw new errors_1.ValidationError('Start date must be before or equal to end date');
        }
        // A simple calculation for days
        const daysRequested = new decimal_js_1.Decimal((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1);
        // Validate allocation or create default
        let allocation = await db_1.prisma.timeOffAllocation.findUnique({
            where: {
                employeeId_typeId: {
                    employeeId: employee.id,
                    typeId: input.typeId,
                },
            },
        });
        if (!allocation) {
            allocation = await db_1.prisma.timeOffAllocation.create({
                data: {
                    employeeId: employee.id,
                    typeId: input.typeId,
                    totalDays: new decimal_js_1.Decimal(20),
                    usedDays: new decimal_js_1.Decimal(0),
                    remainingDays: new decimal_js_1.Decimal(20),
                }
            });
        }
        const available = new decimal_js_1.Decimal(allocation.totalDays).minus(allocation.usedDays);
        if (available.lessThan(daysRequested)) {
            throw new errors_1.ValidationError('Insufficient time off balance');
        }
        return db_1.prisma.timeOffRequest.create({
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
    async approve(orgId, id) {
        return db_1.prisma.$transaction(async (tx) => {
            const request = await tx.timeOffRequest.findUnique({
                where: { id },
                include: { employee: true },
            });
            if (!request || request.employee.orgId !== orgId) {
                throw new errors_1.NotFoundError('Time off request not found');
            }
            if (request.status !== 'PENDING') {
                throw new errors_1.InvalidStateTransitionError(`Cannot approve request in ${request.status} state`);
            }
            const daysRequested = new decimal_js_1.Decimal((request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24) + 1);
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
                        totalDays: new decimal_js_1.Decimal(20),
                        usedDays: new decimal_js_1.Decimal(0),
                        remainingDays: new decimal_js_1.Decimal(20),
                    }
                });
            }
            const available = new decimal_js_1.Decimal(allocation.totalDays).minus(allocation.usedDays);
            if (available.lessThan(daysRequested)) {
                throw new errors_1.ValidationError('Insufficient time off balance for approval');
            }
            await tx.timeOffAllocation.update({
                where: { id: allocation.id },
                data: {
                    usedDays: new decimal_js_1.Decimal(allocation.usedDays).plus(daysRequested),
                    remainingDays: new decimal_js_1.Decimal(allocation.totalDays).minus(new decimal_js_1.Decimal(allocation.usedDays).plus(daysRequested)),
                },
            });
            return tx.timeOffRequest.update({
                where: { id },
                data: { status: 'APPROVED' },
            });
        });
    }
    async reject(orgId, id) {
        const request = await db_1.prisma.timeOffRequest.findUnique({
            where: { id },
            include: { employee: true },
        });
        if (!request || request.employee.orgId !== orgId) {
            throw new errors_1.NotFoundError('Time off request not found');
        }
        if (request.status !== 'PENDING') {
            throw new errors_1.InvalidStateTransitionError(`Cannot reject request in ${request.status} state`);
        }
        return db_1.prisma.timeOffRequest.update({
            where: { id },
            data: { status: 'REJECTED' },
        });
    }
}
exports.TimeOffService = TimeOffService;
