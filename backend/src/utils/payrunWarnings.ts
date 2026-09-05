import { prisma } from '../database/db';

export interface PayrunWarning {
  employeeId: string;
  employeeName: string;
  type: 'MISSING_BANK_ACCOUNT' | 'DUPLICATE_PAYSLIP' | 'EXPIRING_CONTRACT' | 'DRAFT_STATUS';
  message: string;
}

export async function generatePayrunWarnings(payrunId: string): Promise<PayrunWarning[]> {
  const warnings: PayrunWarning[] = [];

  const payrun = await prisma.payrun.findUnique({
    where: { id: payrunId },
    include: {
      payslips: {
        include: {
          employee: {
            include: {
              contracts: true,
            },
          },
        },
      },
    },
  });

  if (!payrun) return warnings;

  const seenEmployeeIds = new Set<string>();

  for (const slip of payrun.payslips) {
    const emp = slip.employee;
    const empName = `${emp.firstName} ${emp.lastName}`;

    // 1. Check Duplicate Payslip in same payrun
    if (seenEmployeeIds.has(emp.id)) {
      warnings.push({
        employeeId: emp.id,
        employeeName: empName,
        type: 'DUPLICATE_PAYSLIP',
        message: `Duplicate payslip generated for ${empName} in payrun.`,
      });
    }
    seenEmployeeIds.add(emp.id);

    // 2. Check Expiring Contract
    const activeContract = emp.contracts.find(c => String(c.status) === 'ACTIVE' || String(c.status) === 'RUNNING');
    if (activeContract && activeContract.endDate) {
      if (activeContract.endDate >= payrun.periodStart && activeContract.endDate <= payrun.periodEnd) {
        warnings.push({
          employeeId: emp.id,
          employeeName: empName,
          type: 'EXPIRING_CONTRACT',
          message: `Contract for ${empName} expires during payrun period.`,
        });
      }
    }

    // 3. Check Draft Status
    if (String(slip.status) === 'DRAFT') {
      warnings.push({
        employeeId: emp.id,
        employeeName: empName,
        type: 'DRAFT_STATUS',
        message: `Payslip for ${empName} remains in DRAFT status.`,
      });
    }
  }

  return warnings;
}
