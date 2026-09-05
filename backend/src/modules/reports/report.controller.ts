import { FastifyReply, FastifyRequest } from 'fastify';
import { ReportService } from './report.service';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  getPayrunSummary = async (request: FastifyRequest<{ Params: { payrunId: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { payrunId } = request.params;
    
    const result = await this.reportService.getPayrunSummary(orgId, payrunId);
    return reply.send({ success: true, data: result });
  };

  getEmployeePayslip = async (request: FastifyRequest<{ Params: { payrunId: string, employeeId: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { payrunId, employeeId } = request.params;
    
    const result = await this.reportService.getEmployeePayslip(orgId, payrunId, employeeId);
    return reply.send({ success: true, data: result });
  };
}
