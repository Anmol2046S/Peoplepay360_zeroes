import { prisma } from '../config/database';

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

    // 1. Check Missing Bank Details
    if (!emp.bankAccountNumber || !emp.ifscCode) {
      warnings.push({
        employeeId: emp.id,
        employeeName: empName,
        type: 'MISSING_BANK_ACCOUNT',
        message: `Employee ${empName} (${emp.employeeCode}) is missing bank account or IFSC information.`,
      });
    }

    // 2. Check Duplicate Payslip in same payrun
    if (seenEmployeeIds.has(emp.id)) {
      warnings.push({
        employeeId: emp.id,
        employeeName: empName,
        type: 'DUPLICATE_PAYSLIP',
        message: `Duplicate payslip generated for ${empName} in payrun ${payrun.name}.`,
      });
    }
    seenEmployeeIds.add(emp.id);

    // 3. Check Expiring Contract
    const activeContract = emp.contracts.find(c => c.status === 'RUNNING');
    if (activeContract && activeContract.endDate) {
      if (activeContract.endDate >= payrun.startDate && activeContract.endDate <= payrun.endDate) {
        warnings.push({
          employeeId: emp.id,
          employeeName: empName,
          type: 'EXPIRING_CONTRACT',
          message: `Contract ${activeContract.contractReference} for ${empName} expires during payrun period.`,
        });
      }
    }

    // 4. Check Draft Status
    if (slip.status === 'DRAFT') {
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
