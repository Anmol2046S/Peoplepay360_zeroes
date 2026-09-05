import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../database/db';

export class DashboardController {
  async getMetrics(request: FastifyRequest, reply: FastifyReply) {
    const orgId = request.user?.orgId;

    if (!orgId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    try {
      // 1. Total Employees
      const totalEmployees = await prisma.employee.count({
        where: { orgId, status: 'ACTIVE' }
      });

      // 2. Pending Approvals (TimeOff Requests)
      const pendingApprovals = await prisma.timeOffRequest.count({
        where: { 
          employee: { orgId },
          status: 'PENDING' 
        }
      });

      // 3. Payroll Status (Latest Payrun)
      const latestPayrun = await prisma.payrun.findFirst({
        where: { orgId },
        orderBy: { periodStart: 'desc' }
      });

      // 4. On Leave Today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const onLeaveToday = await prisma.timeOffRequest.count({
        where: {
          employee: { orgId },
          status: 'APPROVED',
          startDate: { lte: today },
          endDate: { gte: today }
        }
      });

      // 5. Attendance Trend (Last 5 Days) — use a single groupBy query instead of 10 loop queries
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const rangeStart = new Date();
      rangeStart.setDate(rangeStart.getDate() - 4);
      rangeStart.setHours(0, 0, 0, 0);

      const attendanceRows = await prisma.attendance.groupBy({
        by: ['date', 'status'],
        where: {
          employee: { orgId },
          date: { gte: rangeStart },
          status: { in: ['PRESENT', 'ABSENT'] },
        },
        _count: { status: true },
      });

      // Build a lookup map: date-string → { present, absent }
      const trendMap: Record<string, { present: number; absent: number }> = {};
      for (const row of attendanceRows) {
        const key = row.date.toISOString().split('T')[0];
        if (!trendMap[key]) trendMap[key] = { present: 0, absent: 0 };
        if (row.status === 'PRESENT') trendMap[key].present = row._count.status;
        if (row.status === 'ABSENT')  trendMap[key].absent  = row._count.status;
      }

      const attendanceTrend = [];
      for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const key = d.toISOString().split('T')[0];
        const slot = trendMap[key] ?? { present: 0, absent: 0 };
        attendanceTrend.push({ name: days[d.getDay()], present: slot.present, absent: slot.absent });
      }

      // 6. Attention Center Items
      const attentionCenter = [];
      
      if (pendingApprovals > 0) {
        attentionCenter.push({
          title: `${pendingApprovals} Time Off requests awaiting approval`,
          time: "Just now",
          urgency: "High",
          color: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
        });
      }

      if (latestPayrun && latestPayrun.status === 'DRAFT') {
        attentionCenter.push({
          title: "Payroll processing window is open (Draft)",
          time: "1 hour ago",
          urgency: "High",
          color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
        });
      }

      // Add default items if empty to keep dashboard populated
      if (attentionCenter.length === 0) {
        attentionCenter.push({
          title: "All systems operational",
          time: "Just now",
          urgency: "Low",
          color: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
        });
      }

      return reply.send({
        metrics: {
          totalEmployees,
          onLeaveToday,
          pendingApprovals,
          payrollStatus: latestPayrun ? latestPayrun.status : 'None',
        },
        attentionCenter,
        attendanceTrend,
      });

    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch dashboard metrics' });
    }
  }
}
