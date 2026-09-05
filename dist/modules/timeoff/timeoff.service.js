"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeOffService = void 0;
const db_1 = require("../../database/db");
const errors_1 = require("../../shared/errors");
const decimal_js_1 = require("decimal.js");
class TimeOffService {
    async requestTimeOff(orgId, input) {
        const employee = await db_1.prisma.employee.findFirst({
            where: { id: input.employeeId, orgId },
        });
        if (!employee)
            throw new errors_1.NotFoundError('Employee not found');
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        if (startDate > endDate) {
            throw new errors_1.ValidationError('Start date must be before or equal to end date');
        }
        // A simple calculation for days (ignoring weekends for this hackathon version)
        const daysRequested = new decimal_js_1.Decimal((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1);
        // Validate allocation
        const allocation = await db_1.prisma.timeOffAllocation.findUnique({
            where: {
                employeeId_typeId: {
                    employeeId: input.employeeId,
                    typeId: input.typeId,
                },
            },
        });
        if (!allocation) {
            throw new errors_1.ValidationError('No time off allocation found for this type');
        }
        const available = new decimal_js_1.Decimal(allocation.totalDays).minus(allocation.usedDays);
        if (available.lessThan(daysRequested)) {
            throw new errors_1.ValidationError('Insufficient time off balance');
        }
        return db_1.prisma.timeOffRequest.create({
            data: {
                employeeId: input.employeeId,
                typeId: input.typeId,
                startDate,
                endDate,
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
            const allocation = await tx.timeOffAllocation.findUnique({
                where: {
                    employeeId_typeId: {
                        employeeId: request.employeeId,
                        typeId: request.typeId,
                    },
                },
            });
            if (!allocation)
                throw new errors_1.ValidationError('Allocation not found');
            const available = new decimal_js_1.Decimal(allocation.totalDays).minus(allocation.usedDays);
            if (available.lessThan(daysRequested)) {
                throw new errors_1.ValidationError('Insufficient time off balance for approval');
            }
            await tx.timeOffAllocation.update({
                where: { id: allocation.id },
                data: {
                    usedDays: new decimal_js_1.Decimal(allocation.usedDays).plus(daysRequested),
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
