import { prisma } from '../../../database/db';
import { NotFoundError, InvalidStateTransitionError, ValidationError } from '../../../shared/errors';
import { Decimal } from 'decimal.js';
import { Parser } from 'expr-eval';

const COMPUTATION_STRATEGIES: Record<string, (rule: any, context: Record<string, number>) => Decimal> = {
  FIXED: (rule) => new Decimal(rule.value || 0),
  PERCENTAGE: (rule, context) => {
    if (rule.dependsOn && rule.dependsOn.length > 0) {
      const baseVal = context[rule.dependsOn[0]] || 0;
      return new Decimal(baseVal).mul(new Decimal(rule.value || 0)).div(100);
    }
    return new Decimal(0);
  },
  FORMULA: (rule, context) => {
    // If a formula string is available on the rule, evaluate it
    if (rule.formula && typeof rule.formula === 'string') {
      try {
        const parser = new Parser();
        const expr = parser.parse(rule.formula);
        const result = expr.evaluate(context);
        return new Decimal(result ?? 0);
      } catch (e) {
        // Formula parse/eval error — fall back to sum of dependencies
      }
    }
    // Fallback: sum of declared dependency values in context
    let sum = new Decimal(0);
    for (const dep of rule.dependsOn || []) {
      sum = sum.add(context[dep] || 0);
    }
    return sum;
  }
};

export class EngineService {
  async calculatePayrun(orgId: string, payrunId: string) {
    const payrun = await prisma.payrun.findFirst({
      where: { id: payrunId, orgId },
      include: {
        employees: {
          include: {
            employee: true,
            contract: {
              include: { workingSchedules: true },
            },
          },
        },
      },
    });

    if (!payrun) throw new NotFoundError('Payrun not found');
    if (payrun.status !== 'DRAFT') {
      throw new InvalidStateTransitionError(`Cannot calculate payrun in ${payrun.status} state`);
    }

    // Move to calculating state
    await prisma.payrun.update({
      where: { id: payrunId },
      data: { status: 'CALCULATING' },
    });

    try {
      for (const prEmp of payrun.employees) {
        await this.calculateEmployee(payrun, prEmp);
      }

      // Mark ready for validation
      await prisma.payrun.update({
        where: { id: payrunId },
        data: { status: 'VALIDATING' },
      });

    } catch (error: any) {
      // Revert to DRAFT on calculation failure so it can be fixed
      await prisma.payrun.update({
        where: { id: payrunId },
        data: { status: 'DRAFT' },
      });
      throw new ValidationError(`Calculation failed: ${error.message}`);
    }

    return { success: true };
  }

  private async calculateEmployee(payrun: any, prEmp: any) {
    // 1. Fetch Salary Structure & Rules
    const structure = await prisma.salaryStructure.findUnique({
      where: { id: prEmp.structureId },
      include: { rules: { orderBy: { sequence: 'asc' } } },
    });

    if (!structure) throw new ValidationError(`Missing structure ${prEmp.structureId}`);

    const existingPayslip = await prisma.payslip.findUnique({
      where: { 
        payrunId_employeeId: {
          payrunId: payrun.id,
          employeeId: prEmp.employeeId
        }
      },
    });
    if (existingPayslip) {
      await prisma.payslip.delete({ where: { id: existingPayslip.id } });
    }

    // 3. Setup Math Context
    const context: Record<string, number> = {};
    const lines: Array<{ ruleCode: string, category: string, amount: Decimal, sequence: number }> = [];

    let gross = new Decimal(0);
    let totalDeductions = new Decimal(0);
    let netOverride: Decimal | null = null;

    // 4. Evaluate Rules In Order
    for (const rule of structure.rules) {
      const compute = COMPUTATION_STRATEGIES[rule.computationType];
      const amount = compute ? compute(rule, context) : new Decimal(0);

      // Add to context for future rules to reference by code
      context[rule.code] = amount.toNumber();

      // Accumulate Gross/Net based on category
      if (rule.category === 'BASIC' || rule.category === 'ALLOWANCE') {
        gross = gross.add(amount);
      } else if (rule.category === 'DEDUCTION') {
        totalDeductions = totalDeductions.add(amount);
      } else if (rule.category === 'NET') {
        // Explicit NET rule overrides automatic calculation
        netOverride = amount;
      }

      lines.push({
        ruleCode: rule.code,
        category: rule.category,
        amount: amount,
        sequence: rule.sequence,
      });
    }

    // Net = explicit NET rule if present, otherwise gross minus all deductions
    const net = netOverride !== null ? netOverride : gross.minus(totalDeductions);

    // 5. Save Payslip inside a transaction
    await prisma.$transaction(async (tx: any) => {
      const payslip = await tx.payslip.create({
        data: {
          payrunId: payrun.id,
          employeeId: prEmp.employeeId,
          grossAmount: gross,
          netAmount: net,
          status: 'DRAFT',
        },
      });

      await tx.payslipLine.createMany({
        data: lines.map((l) => ({
          payslipId: payslip.id,
          ruleCode: l.ruleCode,
          category: l.category,
          amount: l.amount,
          sequence: l.sequence,
        })),
      });
      
      await tx.payrunEmployee.update({
        where: { id: prEmp.id },
        data: { status: 'CALCULATED' }
      });
    });
  }
}
