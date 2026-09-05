"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureService = void 0;
const db_1 = require("../../../database/db");
const errors_1 = require("../../../shared/errors");
class StructureService {
    async create(orgId, input) {
        return db_1.prisma.salaryStructure.create({
            data: {
                orgId,
                name: input.name,
            },
        });
    }
    async getAll(orgId) {
        return db_1.prisma.salaryStructure.findMany({
            where: { orgId },
            include: {
                rules: {
                    orderBy: { sequence: 'asc' },
                },
            },
        });
    }
    async getById(orgId, id) {
        const structure = await db_1.prisma.salaryStructure.findFirst({
            where: { id, orgId },
            include: {
                rules: {
                    orderBy: { sequence: 'asc' },
                },
            },
        });
        if (!structure)
            throw new errors_1.NotFoundError('Salary structure not found');
        return structure;
    }
    async update(orgId, id, input) {
        const structure = await db_1.prisma.salaryStructure.findFirst({
            where: { id, orgId },
        });
        if (!structure)
            throw new errors_1.NotFoundError('Salary structure not found');
        return db_1.prisma.salaryStructure.update({
            where: { id },
            data: {
                name: input.name,
                // In a real app, updating a structure might bump the version number
                version: { increment: 1 },
            },
        });
    }
}
exports.StructureService = StructureService;
