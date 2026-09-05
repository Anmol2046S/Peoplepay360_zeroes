"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const client_1 = require("@prisma/client");
class ContractService {
    static async getAllContracts(query) {
        const where = {};
        if (query.employeeId)
            where.employeeId = query.employeeId;
        if (query.status)
            where.status = query.status;
        const contracts = await database_1.prisma.contract.findMany({
            where,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, jobPosition: true } },
                department: { select: { id: true, name: true } },
                salaryStructure: { select: { id: true, name: true } },
                workingSchedule: { select: { id: true, name: true } },
            },
            orderBy: { startDate: 'desc' },
        });
        return contracts;
    }
    static async getContractById(id) {
        const contract = await database_1.prisma.contract.findUnique({
            where: { id },
            include: {
                employee: true,
                department: true,
                salaryStructure: { include: { rules: true } },
                workingSchedule: { include: { days: true } },
            },
        });
        if (!contract) {
            throw new apiResponse_1.AppError(`Contract with ID ${id} not found.`, 404, 'CONTRACT_NOT_FOUND');
        }
        return contract;
    }
    static async createContract(data) {
        // Check reference unique
        const existing = await database_1.prisma.contract.findUnique({ where: { contractReference: data.contractReference } });
        if (existing) {
            throw new apiResponse_1.AppError(`Contract reference ${data.contractReference} already exists.`, 400, 'REFERENCE_EXISTS');
        }
        const newContract = await database_1.prisma.contract.create({
            data: {
                contractReference: data.contractReference,
                employeeId: data.employeeId,
                departmentId: data.departmentId,
                workingScheduleId: data.workingScheduleId,
                salaryStructureId: data.salaryStructureId,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                monthlyWage: parseFloat(data.monthlyWage),
                status: data.status || client_1.ContractStatus.DRAFT,
                notes: data.notes,
            },
            include: {
                employee: true,
                salaryStructure: true,
            },
        });
        return newContract;
    }
    /**
     * Resolves exactly ONE active RUNNING contract for an employee during a given payroll period.
     * Throws NO_ACTIVE_CONTRACT if 0 found, or CONTRACT_CONFLICT if >1 overlapping running contracts found.
     */
    static async resolveActiveContract(employeeId, periodStart, periodEnd) {
        const runningContracts = await database_1.prisma.contract.findMany({
            where: {
                employeeId,
                status: client_1.ContractStatus.RUNNING,
                startDate: { lte: periodEnd },
                OR: [
                    { endDate: null },
                    { endDate: { gte: periodStart } },
                ],
            },
            include: {
                salaryStructure: { include: { rules: true } },
            },
        });
        if (runningContracts.length === 0) {
            throw new apiResponse_1.AppError(`No active RUNNING contract found for employee ${employeeId} in the selected period.`, 400, 'NO_ACTIVE_CONTRACT');
        }
        if (runningContracts.length > 1) {
            throw new apiResponse_1.AppError(`Conflict: Employee ${employeeId} has ${runningContracts.length} overlapping RUNNING contracts for the selected period.`, 400, 'CONTRACT_CONFLICT');
        }
        return runningContracts[0];
    }
}
exports.ContractService = ContractService;
//# sourceMappingURL=contract.service.js.map