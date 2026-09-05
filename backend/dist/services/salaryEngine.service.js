"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryEngineService = void 0;
const client_1 = require("@prisma/client");
const formulaEvaluator_1 = require("../utils/formulaEvaluator");
class SalaryEngineService {
    /**
     * Evaluates salary rules sequentially by Sequence (1..N).
     */
    static computeSalary(monthlyWage, rules, workedDays = 22) {
        const categoryTotals = {
            WAGE: monthlyWage,
            wage: monthlyWage,
        };
        const lines = [];
        // Sort rules strictly by sequence ascending
        const sortedRules = [...rules].sort((a, b) => a.sequence - b.sequence);
        let basic = 0;
        let gross = 0;
        let net = 0;
        for (const rule of sortedRules) {
            let amount = 0;
            if (rule.computationMethod === client_1.ComputationMethod.FIXED) {
                amount = rule.amount || 0;
            }
            else if (rule.computationMethod === client_1.ComputationMethod.PERCENTAGE) {
                const baseKey = rule.percentageBase || 'WAGE';
                const baseValue = categoryTotals[baseKey] !== undefined ? categoryTotals[baseKey] : monthlyWage;
                amount = (baseValue * (rule.percentage || 0)) / 100;
            }
            else if (rule.computationMethod === client_1.ComputationMethod.FORMULA) {
                amount = (0, formulaEvaluator_1.evaluateFormula)(rule.formula || '0', categoryTotals, workedDays);
            }
            amount = Math.round(amount * 100) / 100;
            categoryTotals[rule.code] = amount;
            if (rule.category === client_1.SalaryRuleCategory.BASIC)
                basic = amount;
            if (rule.category === client_1.SalaryRuleCategory.GROSS)
                gross = amount;
            if (rule.category === client_1.SalaryRuleCategory.NET)
                net = amount;
            lines.push({
                code: rule.code,
                name: rule.name,
                category: rule.category,
                amount,
                sequence: rule.sequence,
            });
        }
        // Fallbacks if GROSS or NET rules were not explicitly defined
        if (gross === 0) {
            const allowances = lines.filter(l => l.category === client_1.SalaryRuleCategory.ALLOWANCE || l.category === client_1.SalaryRuleCategory.BASIC).reduce((acc, l) => acc + l.amount, 0);
            gross = allowances;
        }
        if (net === 0) {
            const deductions = lines.filter(l => l.category === client_1.SalaryRuleCategory.DEDUCTION).reduce((acc, l) => acc + l.amount, 0);
            net = Math.max(0, gross - deductions);
        }
        return {
            lines,
            basic,
            gross,
            net,
        };
    }
}
exports.SalaryEngineService = SalaryEngineService;
//# sourceMappingURL=salaryEngine.service.js.map