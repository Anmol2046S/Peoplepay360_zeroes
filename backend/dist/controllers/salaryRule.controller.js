"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryRuleController = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
class SalaryRuleController {
    static async getAllRules(req, res, next) {
        try {
            const salaryStructureId = req.query.salaryStructureId;
            const where = {};
            if (salaryStructureId)
                where.salaryStructureId = salaryStructureId;
            const rules = await database_1.prisma.salaryRule.findMany({
                where,
                include: {
                    salaryStructure: { select: { id: true, name: true, code: true } },
                },
                orderBy: { sequence: 'asc' },
            });
            return (0, apiResponse_1.sendSuccess)(res, rules, 'Salary rules fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async createRule(req, res, next) {
        try {
            const { name, code, category, sequence, computationMethod, amount, percentage, percentageBase, formula, salaryStructureId } = req.body;
            const newRule = await database_1.prisma.salaryRule.create({
                data: {
                    name,
                    code,
                    category,
                    sequence: parseInt(sequence, 10),
                    computationMethod,
                    amount: amount ? parseFloat(amount) : null,
                    percentage: percentage ? parseFloat(percentage) : null,
                    percentageBase,
                    formula,
                    salaryStructureId,
                },
                include: {
                    salaryStructure: true,
                },
            });
            return (0, apiResponse_1.sendSuccess)(res, newRule, 'Salary rule created successfully', 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async updateRule(req, res, next) {
        try {
            const id = req.params.id;
            const rule = await database_1.prisma.salaryRule.findUnique({ where: { id } });
            if (!rule) {
                throw new apiResponse_1.AppError('Salary rule not found.', 404, 'RULE_NOT_FOUND');
            }
            const updated = await database_1.prisma.salaryRule.update({
                where: { id },
                data: req.body,
            });
            return (0, apiResponse_1.sendSuccess)(res, updated, 'Salary rule updated successfully');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SalaryRuleController = SalaryRuleController;
//# sourceMappingURL=salaryRule.controller.js.map