"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrunService = void 0;
const db_1 = require("../../../database/db");
const errors_1 = require("../../../shared/errors");
const audit_1 = require("../../../shared/audit");
class PayrunService {
    async initialize(orgId, input, createdBy) {
        const now = new Date();
        const pStartRaw = input.periodStart ? new Date(input.periodStart) : new Date(now.getFullYear(), now.getMonth(), 1);
        const pEndRaw = input.periodEnd ? new Date(input.periodEnd) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const periodStart = isNaN(pStartRaw.getTime()) ? new Date(now.getFullYear(), now.getMonth(), 1) : pStartRaw;
        const periodEnd = isNaN(pEndRaw.getTime()) ? new Date(now.getFullYear(), now.getMonth() + 1, 0) : pEndRaw;
        if (periodStart >= periodEnd) {
            throw new errors_1.ValidationError('Period start must be before period end');
        }
        return db_1.prisma.$transaction(async (tx) => {
            // 1. Create the base Payrun record
            const payrun = await tx.payrun.create({
                data: {
                    orgId,
                    periodStart,
                    periodEnd,
                    status: 'DRAFT',
                },
            });
            // 2. Find all eligible contracts for this period
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
            let employeeIds = eligibleContracts.map((contract) => contract.employeeId);
            // If no active contracts, fallback to any employees in org
            if (employeeIds.length === 0) {
                const allEmployees = await tx.employee.findMany({
                    where: { orgId },
                    select: { id: true }
                });
                employeeIds = allEmployees.map(e => e.id);
            }
            // 3. Lock employees into this payrun
            if (employeeIds.length > 0) {
                const payrunEmployeesData = employeeIds.map((empId) => ({
                    payrunId: payrun.id,
                    employeeId: empId,
                    status: 'DRAFT',
                }));
                await tx.payrunEmployee.createMany({
                    data: payrunEmployeesData,
                });
            }
            return tx.payrun.findUnique({
                where: { id: payrun.id },
                include: { _count: { select: { employees: true } } },
            });
        });
    }
    async getById(orgId, id) {
        const payrun = await db_1.prisma.payrun.findFirst({
            where: { id, orgId },
            include: {
                employees: {
                    include: {
                        employee: {
                            include: {
                                contracts: true,
                                department: true,
                                user: true,
                            }
                        }
                    }
                },
                payslips: {
                    include: {
                        employee: {
                            include: { department: true }
                        },
                        lines: true,
                    }
                }
            },
        });
        if (!payrun)
            throw new errors_1.NotFoundError('Payrun not found');
        return payrun;
    }
    async getAll(orgId) {
        return db_1.prisma.payrun.findMany({
            where: { orgId },
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { employees: true } } },
        });
    }
    async submitForApproval(orgId, id) {
        const payrun = await this.getById(orgId, id);
        if (payrun.status !== 'VALIDATING') {
            throw new errors_1.ValidationError(`Cannot submit payrun in ${payrun.status} state. Expected VALIDATING.`);
        }
        return db_1.prisma.payrun.update({
            where: { id },
            data: { status: 'READY_FOR_APPROVAL' },
        });
    }
    async approve(orgId, id, approvedBy) {
        const payrun = await this.getById(orgId, id);
        if (payrun.status !== 'READY_FOR_APPROVAL') {
            throw new errors_1.ValidationError(`Cannot approve payrun in ${payrun.status} state. Expected READY_FOR_APPROVAL.`);
        }
        const updated = await db_1.prisma.payrun.update({
            where: { id },
            data: { status: 'APPROVED' },
        });
        await (0, audit_1.logAudit)({
            orgId,
            userId: approvedBy,
            action: 'APPROVE_PAYRUN',
            entity: 'Payrun',
            entityId: id,
        });
        return updated;
    }
    async reject(orgId, id) {
        const payrun = await this.getById(orgId, id);
        if (payrun.status !== 'READY_FOR_APPROVAL') {
            throw new errors_1.ValidationError(`Cannot reject payrun in ${payrun.status} state. Expected READY_FOR_APPROVAL.`);
        }
        // Rejecting sends it back to DRAFT so it can be recalculated
        return db_1.prisma.payrun.update({
            where: { id },
            data: { status: 'DRAFT' },
        });
    }
    async finalize(orgId, id) {
        const payrun = await this.getById(orgId, id);
        if (payrun.status !== 'APPROVED') {
            throw new errors_1.ValidationError(`Cannot finalize payrun in ${payrun.status} state. Expected APPROVED.`);
        }
        // Atomic finalization of Payrun and all associated Payslips
        return db_1.prisma.$transaction(async (tx) => {
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
            await (0, audit_1.logAudit)({
                orgId,
                userId: 'SYSTEM', // or pass through the acting user
                action: 'FINALIZE_PAYRUN',
                entity: 'Payrun',
                entityId: id,
            });
            return finalized;
        });
    }
    async getMyPayslips(orgId, userId) {
        const employee = await db_1.prisma.employee.findFirst({
            where: {
                orgId,
                userId,
            },
        });
        if (!employee) {
            return [];
        }
        const payslips = await db_1.prisma.payslip.findMany({
            where: {
                employeeId: employee.id,
            },
            include: {
                payrun: true,
                lines: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return payslips.map((slip) => {
            const gross = Number(slip.grossAmount || 0);
            const net = Number(slip.netAmount || 0);
            const deductions = Math.max(0, gross - net);
            return {
                id: slip.id,
                period: slip.payrun?.periodStart
                    ? new Date(slip.payrun.periodStart).toLocaleString('default', { month: 'long', year: 'numeric' })
                    : 'Pay Period',
                gross,
                net,
                deductions,
                status: slip.status === 'FINALIZED' ? 'PAID' : slip.status,
                date: slip.createdAt ? new Date(slip.createdAt).toISOString().split('T')[0] : '',
            };
        });
    }
}
exports.PayrunService = PayrunService;
