"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const db_1 = require("../../database/db");
const errors_1 = require("../../shared/errors");
const decimal_js_1 = require("decimal.js");
class ReportService {
    async getPayrunSummary(orgId, payrunId) {
        const payrun = await db_1.prisma.payrun.findFirst({
            where: { id: payrunId, orgId },
            include: {
                payslips: true,
                _count: { select: { employees: true } }
            }
        });
        if (!payrun)
            throw new errors_1.NotFoundError('Payrun not found');
        let totalGross = new decimal_js_1.Decimal(0);
        let totalNet = new decimal_js_1.Decimal(0);
        let totalEmployees = payrun._count.employees;
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
    async getEmployeePayslip(orgId, payrunId, employeeId) {
        const payslip = await db_1.prisma.payslip.findFirst({
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
        if (!payslip)
            throw new errors_1.NotFoundError('Payslip not found for this employee in the specified payrun');
        return payslip;
    }
}
exports.ReportService = ReportService;
