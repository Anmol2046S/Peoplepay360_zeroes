"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleService = void 0;
const db_1 = require("../../../database/db");
const errors_1 = require("../../../shared/errors");
const decimal_js_1 = require("decimal.js");
class RuleService {
    async create(orgId, input) {
        const structure = await db_1.prisma.salaryStructure.findFirst({
            where: { id: input.structureId, orgId },
        });
        if (!structure)
            throw new errors_1.NotFoundError('Salary structure not found');
        // Check for sequence collisions
        const existingRuleAtSequence = await db_1.prisma.salaryRule.findFirst({
            where: { structureId: input.structureId, sequence: input.sequence },
        });
        if (existingRuleAtSequence) {
            throw new errors_1.ValidationError(`Sequence ${input.sequence} is already occupied by rule ${existingRuleAtSequence.code}`);
        }
        // Check code uniqueness within structure
        const existingCode = await db_1.prisma.salaryRule.findUnique({
            where: {
                structureId_code: { structureId: input.structureId, code: input.code },
            },
        });
        if (existingCode) {
            throw new errors_1.ValidationError(`Rule code ${input.code} already exists in this structure`);
        }
        return db_1.prisma.salaryRule.create({
            data: {
                structureId: input.structureId,
                code: input.code,
                name: input.name,
                category: input.category,
                computationType: input.computationType,
                sequence: input.sequence,
                value: input.value ? new decimal_js_1.Decimal(input.value) : null,
                dependsOn: input.dependsOn,
            },
        });
    }
    async getByStructureId(orgId, structureId) {
        const structure = await db_1.prisma.salaryStructure.findFirst({
            where: { id: structureId, orgId },
        });
        if (!structure)
            throw new errors_1.NotFoundError('Salary structure not found');
        return db_1.prisma.salaryRule.findMany({
            where: { structureId },
            orderBy: { sequence: 'asc' },
        });
    }
}
exports.RuleService = RuleService;
