import { FastifyReply, FastifyRequest } from 'fastify';
import { PayrunService } from './payrun.service';
import { CreatePayrunSchema } from './payrun.schema';

export class PayrunController {
  private payrunService: PayrunService;

  constructor() {
    this.payrunService = new PayrunService();
  }

  initialize = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = CreatePayrunSchema.parse(request.body);
    const orgId = request.user!.orgId;
    const userId = request.user!.id;
    
    const result = await this.payrunService.initialize(orgId, input, userId);
    return reply.status(201).send({ success: true, data: result });
  };

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const results = await this.payrunService.getAll(orgId);
    return reply.send({ success: true, data: results });
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.payrunService.getById(orgId, id);
    return reply.send({ success: true, data: result });
  };

  submitForApproval = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.payrunService.submitForApproval(orgId, id);
    return reply.send({ success: true, data: result });
  };

  approve = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const userId = request.user!.id;
    const result = await this.payrunService.approve(orgId, id, userId);
    return reply.send({ success: true, data: result });
  };

  reject = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.payrunService.reject(orgId, id);
    return reply.send({ success: true, data: result });
  };

  finalize = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.payrunService.finalize(orgId, id);
    return reply.send({ success: true, data: result });
  };

  getMyPayslips = async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const userId = request.user!.id;
    const { prisma } = await import('../../../database/db');
    
    // Find employee linked to this user
    const employee = await prisma.employee.findFirst({
      where: { userId, orgId }
    });

    const where: any = employee ? { employeeId: employee.id } : { payrun: { orgId } };

    const payslips = await prisma.payslip.findMany({
      where,
      include: {
        payrun: true,
        employee: true,
        lines: { orderBy: { sequence: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });

    const formatted = payslips.map((p) => {
      const start = p.payrun?.periodStart ? new Date(p.payrun.periodStart) : new Date();
      const periodStr = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const gross = Number(p.grossAmount);
      const net = Number(p.netAmount);
      return {
        id: p.id,
        payslipNumber: `PS-${p.id.slice(-6).toUpperCase()}`,
        period: periodStr,
        gross,
        grossAmount: gross,
        net,
        netAmount: net,
        deductions: gross - net,
        status: p.status === 'FINALIZED' ? 'PAID' : p.status,
        date: p.createdAt.toISOString().split('T')[0],
        employeeId: p.employeeId,
        employeeName: `${p.employee.firstName} ${p.employee.lastName}`,
        lines: p.lines.map((l) => ({
          id: l.id,
          code: l.ruleCode,
          ruleCode: l.ruleCode,
          name: l.ruleCode,
          category: l.category,
          amount: Number(l.amount),
          sequence: l.sequence,
        })),
      };
    });

    return reply.send({ success: true, payslips: formatted, data: formatted });
  };
}
