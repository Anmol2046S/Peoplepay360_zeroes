"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrunService = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const contract_service_1 = require("./contract.service");
const salaryEngine_service_1 = require("./salaryEngine.service");
const payrunWarnings_1 = require("../utils/payrunWarnings");
const client_1 = require("@prisma/client");
class PayrunService {
    static async getAllPayruns() {
        const payruns = await database_1.prisma.payrun.findMany({
            include: {
                salaryStructure: { select: { id: true, name: true } },
                _count: { select: { payslips: true } },
            },
            orderBy: { startDate: 'desc' },
        });
        return payruns.map(p => ({
            ...p,
            employeeCount: p._count.payslips,
        }));
    }
    static async getPayrunById(id) {
        const payrun = await database_1.prisma.payrun.findUnique({
            where: { id },
            include: {
                salaryStructure: { include: { rules: true } },
                payslips: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                employeeCode: true,
                                firstName: true,
                                lastName: true,
                                jobPosition: true,
                                bankAccountNumber: true,
                                bankName: true,
                                ifscCode: true,
                                department: { select: { name: true } },
                            },
                        },
                        lines: true,
                    },
                },
            },
        });
        if (!payrun) {
            throw new apiResponse_1.AppError(`Payrun with ID ${id} not found.`, 404, 'PAYRUN_NOT_FOUND');
        }
        const warnings = await (0, payrunWarnings_1.generatePayrunWarnings)(payrun.id);
        return {
            ...payrun,
            warnings,
        };
    }
    /**
     * Wizard Step 2: Fetch eligible employees with active RUNNING contract for selected scope & period.
     */
    static async getEligibleEmployees(salaryStructureId, startDateStr, endDateStr) {
        const periodStart = new Date(startDateStr);
        const periodEnd = new Date(endDateStr);
        const contracts = await database_1.prisma.contract.findMany({
            where: {
                status: 'RUNNING',
                salaryStructureId,
                startDate: { lte: periodEnd },
                OR: [
                    { endDate: null },
                    { endDate: { gte: periodStart } },
                ],
            },
            include: {
                employee: {
                    include: {
                        department: { select: { name: true } },
                        workingSchedule: { select: { name: true, hoursPerWeek: true } },
                    },
                },
            },
        });
        return contracts.map(c => ({
            employeeId: c.employee.id,
            employeeCode: c.employee.employeeCode,
            name: `${c.employee.firstName} ${c.employee.lastName}`,
            department: c.employee.department.name,
            jobPosition: c.employee.jobPosition,
            monthlyWage: c.monthlyWage,
            workingHours: c.employee.workingSchedule ? `${c.employee.workingSchedule.hoursPerWeek} hours/week` : '40 hours/week',
            contractReference: c.contractReference,
            startDate: c.startDate,
        }));
    }
    /**
     * Wizard Finalize: Initialize Payrun with explicitly selected employee IDs.
     */
    static async createPayrun(data) {
        if (!data.employeeIds || data.employeeIds.length === 0) {
            throw new apiResponse_1.AppError('At least one employee must be selected to create a Payrun.', 400, 'NO_EMPLOYEES_SELECTED');
        }
        const periodStart = new Date(data.startDate);
        const periodEnd = new Date(data.endDate);
        const structure = await database_1.prisma.salaryStructure.findUnique({
            where: { id: data.salaryStructureId },
            include: { rules: true },
        });
        if (!structure) {
            throw new apiResponse_1.AppError('Salary structure not found.', 404, 'STRUCTURE_NOT_FOUND');
        }
        // Create Payrun transactionally with initial draft payslips for selected employees
        return database_1.prisma.$transaction(async (tx) => {
            const payrun = await tx.payrun.create({
                data: {
                    name: data.name,
                    startDate: periodStart,
                    endDate: periodEnd,
                    salaryStructureId: data.salaryStructureId,
                    status: client_1.PayrunStatus.DRAFT,
                },
            });
            let slipCounter = 1;
            for (const empId of data.employeeIds) {
                // Resolve contract
                const contract = await contract_service_1.ContractService.resolveActiveContract(empId, periodStart, periodEnd);
                const payslipNum = `SLIP/${periodStart.getFullYear()}/${(periodStart.getMonth() + 1).toString().padStart(2, '0')}/${slipCounter.toString().padStart(3, '0')}`;
                slipCounter++;
                await tx.payslip.create({
                    data: {
                        payslipNumber: payslipNum,
                        employeeId: empId,
                        contractId: contract.id,
                        payrunId: payrun.id,
                        startDate: periodStart,
                        endDate: periodEnd,
                        workedDays: 22.0,
                        basicWage: contract.monthlyWage * 0.5,
                        grossWage: contract.monthlyWage,
                        netWage: contract.monthlyWage * 0.85,
                        status: client_1.PayslipStatus.DRAFT,
                    },
                });
            }
            return payrun;
        });
    }
    /**
     * Compute Payrun: Executes Salary Engine for every employee payslip in payrun.
     */
    static async computePayrun(payrunId) {
        const payrun = await database_1.prisma.payrun.findUnique({
            where: { id: payrunId },
            include: {
                salaryStructure: { include: { rules: true } },
                payslips: {
                    include: {
                        employee: true,
                        contract: true,
                    },
                },
            },
        });
        if (!payrun) {
            throw new apiResponse_1.AppError('Payrun not found.', 404, 'PAYRUN_NOT_FOUND');
        }
        let totalGross = 0;
        let totalNet = 0;
        await database_1.prisma.$transaction(async (tx) => {
            for (const slip of payrun.payslips) {
                // Compute using salary engine
                const calculation = salaryEngine_service_1.SalaryEngineService.computeSalary(slip.contract.monthlyWage, payrun.salaryStructure.rules, slip.workedDays);
                totalGross += calculation.gross;
                totalNet += calculation.net;
                // Delete existing lines if re-computing
                await tx.payslipLine.deleteMany({ where: { payslipId: slip.id } });
                // Insert new lines
                await tx.payslipLine.createMany({
                    data: calculation.lines.map(l => ({
                        payslipId: slip.id,
                        code: l.code,
                        name: l.name,
                        category: l.category,
                        amount: l.amount,
                        sequence: l.sequence,
                    })),
                });
                // Update Payslip record
                await tx.payslip.update({
                    where: { id: slip.id },
                    data: {
                        basicWage: calculation.basic,
                        grossWage: calculation.gross,
                        netWage: calculation.net,
                        status: client_1.PayslipStatus.DRAFT,
                    },
                });
            }
            const warnings = await (0, payrunWarnings_1.generatePayrunWarnings)(payrunId);
            await tx.payrun.update({
                where: { id: payrunId },
                data: {
                    status: client_1.PayrunStatus.COMPUTED,
                    totalGross,
                    totalNet,
                    warningsCount: warnings.length,
                },
            });
        });
        return this.getPayrunById(payrunId);
    }
    /**
     * Validate Payrun: Transitions state to VALIDATED.
     */
    static async validatePayrun(payrunId) {
        const payrun = await database_1.prisma.payrun.findUnique({ where: { id: payrunId } });
        if (!payrun) {
            throw new apiResponse_1.AppError('Payrun not found.', 404, 'PAYRUN_NOT_FOUND');
        }
        const updated = await database_1.prisma.payrun.update({
            where: { id: payrunId },
            data: { status: client_1.PayrunStatus.VALIDATED },
        });
        return updated;
    }
    /**
     * Mark Paid: Finalizes payment for all payslips in payrun.
     */
    static async markPaid(payrunId) {
        const payrun = await database_1.prisma.payrun.findUnique({
            where: { id: payrunId },
            include: { payslips: true },
        });
        if (!payrun) {
            throw new apiResponse_1.AppError('Payrun not found.', 404, 'PAYRUN_NOT_FOUND');
        }
        if (payrun.status !== client_1.PayrunStatus.VALIDATED && payrun.status !== client_1.PayrunStatus.COMPUTED) {
            throw new apiResponse_1.AppError('Payrun must be computed or validated before marking as paid.', 400, 'INVALID_PAYRUN_STATE');
        }
        await database_1.prisma.$transaction(async (tx) => {
            await tx.payrun.update({
                where: { id: payrunId },
                data: { status: client_1.PayrunStatus.PAID },
            });
            await tx.payslip.updateMany({
                where: { payrunId },
                data: { status: client_1.PayslipStatus.DONE },
            });
        });
        return this.getPayrunById(payrunId);
    }
}
exports.PayrunService = PayrunService;
//# sourceMappingURL=payrun.service.js.map