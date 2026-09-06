import { prisma } from '../../database/db';
import { getRoleGreeting, normalizeRoleName, canAccessAiTool, type AiUserContext } from './aiAccess';
import { LocalAiProvider } from './aiProvider';
import Decimal from 'decimal.js';

export type AiChatRequest = {
  message: string;
  conversationId?: string;
};

export type AiChatResult = {
  message: string;
  conversationId: string;
  dataSources: string[];
  timestamp: string;
};

export class AiService {
  private readonly provider: LocalAiProvider;

  constructor() {
    this.provider = new LocalAiProvider();
  }

  private result(message: string, dataSources: string[], conversationId?: string): AiChatResult {
    return {
      message,
      conversationId: conversationId || 'new-chat',
      dataSources,
      timestamp: new Date().toISOString(),
    };
  }

  private async getMyCurrentAttendance(user: AiUserContext, conversationId?: string): Promise<AiChatResult> {
    if (!canAccessAiTool(user, 'getMyAttendance', { employeeId: user.employeeId })) {
      return this.result("I don't have permission to access your attendance.", ['AUTHZ'], conversationId);
    }

    if (!user.employeeId) {
      return this.result("I don't have a verified employee profile for your account.", ['AUTHZ'], conversationId);
    }

    const employee = await prisma.employee.findFirst({
      where: { id: user.employeeId, orgId: user.orgId, userId: user.id },
      select: { firstName: true, lastName: true },
    });

    if (!employee) {
      return this.result("I don't have a verified employee profile for your account.", ['HR'], conversationId);
    }

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId: user.employeeId,
        date: { gte: todayStart, lt: tomorrowStart },
      },
      orderBy: { date: 'desc' },
      select: { checkIn: true, checkOut: true, status: true, workedHours: true },
    });

    if (!attendance) {
      return this.result(`There is no attendance record for you today (${todayStart.toISOString().slice(0, 10)}).`, ['ATTENDANCE'], conversationId);
    }

    const checkIn = attendance.checkIn.toISOString();
    if (!attendance.checkOut) {
      return this.result(`Your attendance is ${attendance.status.toLowerCase()} and you are currently checked in. Check-in time: ${checkIn}.`, ['ATTENDANCE'], conversationId);
    }

    const hours = attendance.workedHours ? ` Worked hours: ${attendance.workedHours}.` : '';
    return this.result(`Your attendance is ${attendance.status.toLowerCase()} for today. Check-in: ${checkIn}; check-out: ${attendance.checkOut.toISOString()}.${hours}`, ['ATTENDANCE'], conversationId);
  }

  private async getMyWorkedDays(user: AiUserContext, conversationId?: string): Promise<AiChatResult> {
    if (!canAccessAiTool(user, 'getMyAttendance', { employeeId: user.employeeId }) || !user.employeeId) {
      return this.result("I don't have permission to access your attendance.", ['AUTHZ'], conversationId);
    }

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const nextMonthStart = new Date(monthStart);
    nextMonthStart.setUTCMonth(nextMonthStart.getUTCMonth() + 1);

    const workedDays = await prisma.attendance.count({
      where: {
        employeeId: user.employeeId,
        employee: { orgId: user.orgId, userId: user.id },
        date: { gte: monthStart, lt: nextMonthStart },
        status: { not: 'ABSENT' },
      },
    });

    const monthName = monthStart.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
    return this.result(`You worked ${workedDays} day${workedDays === 1 ? '' : 's'} so far in ${monthName} ${monthStart.getUTCFullYear()}, based on your attendance records.`, ['ATTENDANCE'], conversationId);
  }

  private async getMyLeaveBalance(user: AiUserContext, conversationId?: string): Promise<AiChatResult> {
    if (!canAccessAiTool(user, 'getMyLeaveBalance', { employeeId: user.employeeId }) || !user.employeeId) {
      return this.result("I don't have permission to access your leave balance.", ['AUTHZ'], conversationId);
    }

    const allocations = await prisma.timeOffAllocation.findMany({
      where: { employeeId: user.employeeId, employee: { orgId: user.orgId, userId: user.id } },
      select: { totalDays: true, usedDays: true, timeOffType: { select: { name: true } } },
      orderBy: { timeOffType: { name: 'asc' } },
    });

    if (allocations.length === 0) {
      return this.result('No leave allocations were found for your employee profile.', ['TIME_OFF'], conversationId);
    }

    const balances = allocations.map((allocation) => {
      const remaining = new Decimal(allocation.totalDays.toString()).minus(allocation.usedDays.toString());
      return `${allocation.timeOffType.name}: ${remaining.toString()} days remaining`;
    });
    return this.result(`Your current leave balance is: ${balances.join('; ')}.`, ['TIME_OFF'], conversationId);
  }

  private async getMyLatestPayslip(user: AiUserContext, conversationId?: string): Promise<AiChatResult> {
    if (!canAccessAiTool(user, 'getMyPayslip', { employeeId: user.employeeId }) || !user.employeeId) {
      return this.result("I don't have permission to access your payslip.", ['AUTHZ'], conversationId);
    }

    const payslip = await prisma.payslip.findFirst({
      where: { employeeId: user.employeeId, employee: { orgId: user.orgId, userId: user.id } },
      orderBy: { payrun: { periodEnd: 'desc' } },
      select: {
        grossAmount: true,
        netAmount: true,
        status: true,
        payrun: { select: { periodStart: true, periodEnd: true, status: true } },
        lines: { select: { ruleCode: true, category: true, amount: true }, orderBy: { sequence: 'asc' } },
      },
    });

    if (!payslip) {
      return this.result('No payslip was found for your employee profile.', ['PAYROLL'], conversationId);
    }

    const lineSummary = payslip.lines.length > 0
      ? ` Breakdown: ${payslip.lines.map((line) => `${line.ruleCode} ${line.amount.toString()}`).join(', ')}.`
      : '';
    return this.result(
      `Your latest payslip covers ${payslip.payrun.periodStart.toISOString().slice(0, 10)} to ${payslip.payrun.periodEnd.toISOString().slice(0, 10)}. Gross: ${payslip.grossAmount.toString()}; net: ${payslip.netAmount.toString()}; status: ${payslip.status}.${lineSummary}`,
      ['PAYROLL'],
      conversationId,
    );
  }

  async chat(user: any, input: AiChatRequest): Promise<AiChatResult> {
    const role = normalizeRoleName(user.role || user.roleName || 'EMPLOYEE');
    const aiUser: AiUserContext = {
      id: user.id,
      orgId: user.orgId,
      role,
      permissions: user.permissions || [],
      employeeId: user.employeeId || null,
    };

    const greeting = getRoleGreeting(role);
    const prompt = input.message.trim();

    if (!prompt) {
      return this.result('Please ask a question about your payroll, attendance, or leave.', ['AI'], input.conversationId);
    }

    if (/\b(attend|atted|present|clocked|clock-in|clock in|worked today)\w*/i.test(prompt) && /\b(my|me|i|today|now)\b/i.test(prompt)) {
      try {
        return await this.getMyCurrentAttendance(aiUser, input.conversationId);
      } catch (error) {
        return this.result("I couldn't retrieve your live attendance record. Please try again.", ['ATTENDANCE_ERROR'], input.conversationId);
      }
    }

    if (/(how many|number of|days worked|worked days)/i.test(prompt) && /(work|worked|days|month)/i.test(prompt)) {
      try {
        return await this.getMyWorkedDays(aiUser, input.conversationId);
      } catch (error) {
        return this.result("I couldn't retrieve your live worked-day total. Please try again.", ['ATTENDANCE_ERROR'], input.conversationId);
      }
    }

    if (/(leave|time off|vacation|holiday)/i.test(prompt) && /(balance|remaining|left|available)/i.test(prompt)) {
      try {
        return await this.getMyLeaveBalance(aiUser, input.conversationId);
      } catch (error) {
        return this.result("I couldn't retrieve your live leave balance. Please try again.", ['TIME_OFF_ERROR'], input.conversationId);
      }
    }

    if (/(my|latest|last|explain)/i.test(prompt) && /(payslip|pay slip)/i.test(prompt)) {
      try {
        return await this.getMyLatestPayslip(aiUser, input.conversationId);
      } catch (error) {
        return this.result("I couldn't retrieve your latest payslip. Please try again.", ['PAYROLL_ERROR'], input.conversationId);
      }
    }

    if (prompt.toLowerCase().includes('payroll') || prompt.toLowerCase().includes('payslip') || prompt.toLowerCase().includes('salary')) {
      const policyAllowed = canAccessAiTool(aiUser, 'getPayrollSummary', { orgId: aiUser.orgId });
      if (!policyAllowed) {
        return {
          message: "I don't have permission to provide that payroll information.",
          conversationId: input.conversationId || 'new-chat',
          dataSources: ['AUTHZ'],
          timestamp: new Date().toISOString(),
        };
      }
    }

    const metrics = await prisma.employee.count({ where: { orgId: aiUser.orgId, status: 'ACTIVE' } });
    const attendanceToday = await prisma.attendance.count({ where: { employee: { orgId: aiUser.orgId }, date: new Date() } });

    const systemPrompt = [
      'You are PEOPLEPAY360 AI Copilot.',
      'You are a secure HR and payroll assistant.',
      'Use only verified application data. Never invent employee names, payroll figures, attendance, leave balances, or contracts.',
      'Never claim access beyond the authenticated user permissions.',
      'If data is missing or unauthorized, say: "I don\'t have enough verified data to answer that."',
      'Keep responses concise and factual.',
      'Current user role: ' + role,
      'Current orgId: ' + aiUser.orgId,
      'Current employeeId: ' + (aiUser.employeeId || 'N/A'),
      'Relevant KPIs: total active employees=' + metrics + ', attendance rows today=' + attendanceToday,
      'Greeting: ' + greeting,
    ].join('\n');

    try {
      const grounded = await this.provider.generateResponse(systemPrompt, prompt);
      return {
        message: grounded,
        conversationId: input.conversationId || 'new-chat',
        dataSources: ['ATTENDANCE', 'PAYROLL', 'HR'],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        message: 'I could not retrieve the current HR or payroll data. Please try again.',
        conversationId: input.conversationId || 'new-chat',
        dataSources: ['ERROR'],
        timestamp: new Date().toISOString(),
      };
    }
  }
}
