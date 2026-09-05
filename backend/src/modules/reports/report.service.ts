import { prisma } from '../../database/db';
import { NotFoundError } from '../../shared/errors';
import { Decimal } from 'decimal.js';

export class ReportService {
  async getPayrunSummary(orgId: string, payrunId: string) {
    const payrun = await prisma.payrun.findFirst({
      where: { id: payrunId, orgId },
      include: {
        payslips: true,
        _count: { select: { employees: true } }
      }
    });

    if (!payrun) throw new NotFoundError('Payrun not found');

    let totalGross = new Decimal(0);
    let totalNet = new Decimal(0);
    const totalEmployees = payrun._count.employees;

    for (const slip of payrun.payslips) {
      totalGross = totalGross.add(slip.grossAmount);
      totalNet = totalNet.add(slip.netAmount);
    }

    return {
      payrunId: payrun.id,
      status: payrun.status,
      periodStart: payrun.periodStart,
      periodEnd: payrun.periodEnd,
      totalEmployees,
      totalGross,
      totalNet,
      totalDeductions: totalGross.minus(totalNet),
    };
  }

  async getEmployeePayslip(orgId: string, payrunId: string, employeeId: string) {
    const payslip = await prisma.payslip.findFirst({
      where: {
        payrunId,
        employeeId,
        payrun: { orgId } // ensure it belongs to this tenant
      },
      include: {
        lines: {
          orderBy: { category: 'asc' }
        },
        employee: true,
      }
    });

    if (!payslip) throw new NotFoundError('Payslip not found for this employee in the specified payrun');

    return payslip;
  }
}
