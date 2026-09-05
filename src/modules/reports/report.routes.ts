import { FastifyInstance } from 'fastify';
import { ReportController } from './report.controller';
import { requirePermission } from '../../middleware/auth';

export default async function reportRoutes(app: FastifyInstance) {
  const reportController = new ReportController();

  app.get<{ Params: { payrunId: string } }>('/payruns/:payrunId/summary', { preHandler: [requirePermission('REPORT_VIEW')] }, reportController.getPayrunSummary);
  app.get<{ Params: { payrunId: string, employeeId: string } }>('/payruns/:payrunId/payslips/:employeeId', { preHandler: [requirePermission('REPORT_VIEW')] }, reportController.getEmployeePayslip);
}
