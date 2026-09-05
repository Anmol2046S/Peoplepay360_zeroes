"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const db_1 = require("../../database/db");
const errors_1 = require("../../shared/errors");
const decimal_js_1 = require("decimal.js");
class ContractService {
    async create(orgId, input) {
        // 1. Validate employee exists in org
        const employee = await db_1.prisma.employee.findFirst({
            where: { id: input.employeeId, orgId },
        });
        if (!employee)
            throw new errors_1.NotFoundError('Employee not found');
        const startDate = new Date(input.startDate);
        const endDate = input.endDate ? new Date(input.endDate) : null;
        if (endDate && startDate >= endDate) {
            throw new errors_1.ValidationError('Start date must be before end date');
        }
        // 2. Prevent overlapping active contracts
        const overlapping = await db_1.prisma.employmentContract.findFirst({
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
            throw new errors_1.ValidationError('An active contract already overlaps with the specified period', {
                overlappingId: overlapping.id,
            });
        }
        // 3. Create contract and schedule atomically
        return db_1.prisma.$transaction(async (tx) => {
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
                    hours: new decimal_js_1.Decimal(input.workingSchedule.hours),
                },
            });
            return { contract, schedule };
        });
    }
    async getByEmployee(orgId, employeeId) {
        const employee = await db_1.prisma.employee.findFirst({
            where: { id: employeeId, orgId },
        });
        if (!employee)
            throw new errors_1.NotFoundError('Employee not found');
        return db_1.prisma.employmentContract.findMany({
            where: { employeeId },
            include: { workingSchedules: true, salaryStructure: true },
            orderBy: { startDate: 'desc' },
        });
    }
}
exports.ContractService = ContractService;
