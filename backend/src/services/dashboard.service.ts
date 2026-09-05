import { prisma } from '../config/database';

export class DashboardService {
  static async getMetrics(query: { period?: string; departmentId?: string; company?: string }) {
    // 1. Payslips Aggregations
    const payslips = await prisma.payslip.findMany({
      select: {
        id: true,
        netWage: true,
        grossWage: true,
        status: true,
      },
    });

    const totalNetPaid = payslips.reduce((acc, p) => acc + p.netWage, 0);
    const payslipsGenerated = payslips.length;
    const averageSalary = payslipsGenerated > 0 ? Math.round(totalNetPaid / payslipsGenerated) : 0;

    // 2. Time Off Aggregations
    const timeOffReqs = await prisma.timeOffRequest.findMany({
      where: { status: 'APPROVED' },
      select: { durationDays: true },
    });
    const approvedTimeOffDays = timeOffReqs.reduce((acc, r) => acc + r.durationDays, 0);

    // 3. Attendance Health
    const attendances = await prisma.attendance.findMany({
      select: { status: true },
    });
    const totalAtt = attendances.length;
    const presentAtt = attendances.filter(a => a.status === 'PRESENT' || a.status === 'OVERTIME').length;
    const attendanceHealth = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

    return {
      totalNetPaid,
      payslipsGenerated,
      averageSalary,
      approvedTimeOffDays,
      attendanceHealth,
      period: query.period || 'Sep 2026',
    };
  }

  static async getDepartmentCosts() {
    const departments = await prisma.department.findMany({
      include: {
        employees: {
          include: {
            payslips: {
              select: { netWage: true },
            },
          },
        },
      },
    });

    return departments.map(d => {
      const headcount = d.employees.length;
      const totalCost = d.employees.reduce((acc, emp) => {
        const empNet = emp.payslips.reduce((sum, p) => sum + p.netWage, 0);
        return acc + empNet;
      }, 0);

      return {
        departmentId: d.id,
        departmentName: d.name,
        code: d.code,
        headcount,
        totalCost,
      };
    });
  }

  static async getMonthlySalaryTrend() {
    const payruns = await prisma.payrun.findMany({
      orderBy: { startDate: 'asc' },
      select: {
        name: true,
        startDate: true,
        totalNet: true,
        totalGross: true,
        status: true,
      },
    });

    if (payruns.length === 0) {
      // Mock trend for demonstration if database has only recent period
      return [
        { month: 'Apr', netSalary: 1500000, grossSalary: 1800000 },
        { month: 'May', netSalary: 1550000, grossSalary: 1850000 },
        { month: 'Jun', netSalary: 1600000, grossSalary: 1900000 },
        { month: 'Jul', netSalary: 1650000, grossSalary: 1950000 },
        { month: 'Aug', netSalary: 1700000, grossSalary: 2000000 },
        { month: 'Sep', netSalary: 1840000, grossSalary: 2150000 },
      ];
    }

    return payruns.map(p => ({
      month: p.name,
      netSalary: p.totalNet,
      grossSalary: p.totalGross,
      status: p.status,
    }));
  }

  static async getOperationalAlerts() {
    // Missing bank info
    const missingBankCount = await prisma.employee.count({
      where: {
        OR: [
          { bankAccountNumber: null },
          { ifscCode: null },
        ],
      },
    });

    // Unvalidated draft payruns
    const draftPayrunCount = await prisma.payrun.count({
      where: { status: 'DRAFT' },
    });

    // Contracts expiring soon
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringContractsCount = await prisma.contract.count({
      where: {
        status: 'RUNNING',
        endDate: {
          gte: now,
          lte: thirtyDaysLater,
        },
      },
    });

    return [
      { id: '1', type: 'WARNING', title: 'Missing Bank Information', message: `${missingBankCount} employees missing bank account or IFSC details.` },
      { id: '2', type: 'INFO', title: 'Draft Payruns Pending', message: `${draftPayrunCount} draft payruns require validation.` },
      { id: '3', type: 'WARNING', title: 'Expiring Contracts', message: `${expiringContractsCount} active employee contracts expiring within 30 days.` },
    ];
  }
}
