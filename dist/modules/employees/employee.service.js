"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const db_1 = require("../../database/db");
const errors_1 = require("../../shared/errors");
class EmployeeService {
    async create(orgId, input) {
        return db_1.prisma.employee.create({
            data: {
                orgId,
                firstName: input.firstName,
                lastName: input.lastName,
                userId: input.userId,
                status: input.status,
            },
        });
    }
    async getAll(orgId) {
        return db_1.prisma.employee.findMany({
            where: { orgId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getById(orgId, id) {
        const employee = await db_1.prisma.employee.findFirst({
            where: { id, orgId },
            include: {
                contracts: true,
            },
        });
        if (!employee) {
            throw new errors_1.NotFoundError(`Employee with id ${id} not found`);
        }
        return employee;
    }
    async update(orgId, id, input) {
        const existing = await db_1.prisma.employee.findFirst({ where: { id, orgId } });
        if (!existing) {
            throw new errors_1.NotFoundError(`Employee with id ${id} not found`);
        }
        return db_1.prisma.employee.update({
            where: { id },
            data: input,
        });
    }
}
exports.EmployeeService = EmployeeService;
