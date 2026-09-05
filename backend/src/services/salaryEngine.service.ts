import { SalaryRule, SalaryRuleCategory, ComputationMethod } from '@prisma/client';
import { evaluateFormula } from '../utils/formulaEvaluator';

export interface ComputedLine {
  code: string;
  name: string;
  category: SalaryRuleCategory;
  amount: number;
  sequence: number;
}

export class SalaryEngineService {
  /**
   * Evaluates salary rules sequentially by Sequence (1..N).
   */
  static computeSalary(monthlyWage: number, rules: SalaryRule[], workedDays: number = 22): { lines: ComputedLine[]; basic: number; gross: number; net: number } {
    const categoryTotals: Record<string, number> = {
      WAGE: monthlyWage,
      wage: monthlyWage,
    };

    const lines: ComputedLine[] = [];

    // Sort rules strictly by sequence ascending
    const sortedRules = [...rules].sort((a, b) => a.sequence - b.sequence);

    let basic = 0;
    let gross = 0;
    let net = 0;

    for (const rule of sortedRules) {
      let amount = 0;

      if (rule.computationMethod === ComputationMethod.FIXED) {
        amount = rule.amount || 0;
      } else if (rule.computationMethod === ComputationMethod.PERCENTAGE) {
        const baseKey = rule.percentageBase || 'WAGE';
        const baseValue = categoryTotals[baseKey] !== undefined ? categoryTotals[baseKey] : monthlyWage;
        amount = (baseValue * (rule.percentage || 0)) / 100;
      } else if (rule.computationMethod === ComputationMethod.FORMULA) {
        amount = evaluateFormula(rule.formula || '0', categoryTotals, workedDays);
      }

      amount = Math.round(amount * 100) / 100;
      categoryTotals[rule.code] = amount;

      if (rule.category === SalaryRuleCategory.BASIC) basic = amount;
      if (rule.category === SalaryRuleCategory.GROSS) gross = amount;
      if (rule.category === SalaryRuleCategory.NET) net = amount;

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
      const allowances = lines.filter(l => l.category === SalaryRuleCategory.ALLOWANCE || l.category === SalaryRuleCategory.BASIC).reduce((acc, l) => acc + l.amount, 0);
      gross = allowances;
    }

    if (net === 0) {
      const deductions = lines.filter(l => l.category === SalaryRuleCategory.DEDUCTION).reduce((acc, l) => acc + l.amount, 0);
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
