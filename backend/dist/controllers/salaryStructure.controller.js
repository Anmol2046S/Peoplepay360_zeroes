"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryStructureController = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
class SalaryStructureController {
    static async getAllStructures(req, res, next) {
        try {
            const structures = await database_1.prisma.salaryStructure.findMany({
                include: {
                    rules: { orderBy: { sequence: 'asc' } },
                    _count: { select: { contracts: true, payruns: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
            const formatted = structures.map(s => ({
                ...s,
                ruleCount: s.rules.length,
                employeeCount: s._count.contracts,
            }));
            return (0, apiResponse_1.sendSuccess)(res, formatted, 'Salary structures fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getStructureById(req, res, next) {
        try {
            const id = req.params.id;
            const structure = await database_1.prisma.salaryStructure.findUnique({
                where: { id },
                include: {
                    rules: { orderBy: { sequence: 'asc' } },
                    contracts: { include: { employee: true } },
                },
            });
            if (!structure) {
                throw new apiResponse_1.AppError(`Salary structure with ID ${id} not found.`, 404, 'STRUCTURE_NOT_FOUND');
            }
            return (0, apiResponse_1.sendSuccess)(res, structure, 'Salary structure details fetched');
        }
        catch (err) {
            next(err);
        }
    }
    static async createStructure(req, res, next) {
        try {
            const { name, code, description } = req.body;
            const existing = await database_1.prisma.salaryStructure.findUnique({ where: { code } });
            if (existing) {
                throw new apiResponse_1.AppError(`Structure code ${code} already exists.`, 400, 'CODE_EXISTS');
            }
            const newStruct = await database_1.prisma.salaryStructure.create({
                data: { name, code, description },
            });
            return (0, apiResponse_1.sendSuccess)(res, newStruct, 'Salary structure created successfully', 201);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SalaryStructureController = SalaryStructureController;
//# sourceMappingURL=salaryStructure.controller.js.map