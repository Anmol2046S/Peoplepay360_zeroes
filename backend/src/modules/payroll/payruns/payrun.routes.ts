import { FastifyInstance } from 'fastify';
import { PayrunController } from './payrun.controller';
import { requireAuth, requirePermission } from '../../../middleware/auth';

export default async function payrunRoutes(app: FastifyInstance) {
  const payrunController = new PayrunController();

  app.post('/', { preHandler: [requirePermission(['PAYRUN_CALCULATE', 'PAYROLL_READ', 'REPORT_VIEW', 'EMPLOYEE_READ'])] }, payrunController.initialize);
  app.get('/', { preHandler: [requirePermission(['PAYRUN_READ', 'PAYROLL_READ', 'REPORT_VIEW', 'EMPLOYEE_READ'])] }, payrunController.getAll);
  app.get('/me/payslips', { preHandler: [requireAuth] }, payrunController.getMyPayslips);
  app.get<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission(['PAYRUN_READ', 'PAYROLL_READ', 'REPORT_VIEW', 'EMPLOYEE_READ'])] }, payrunController.getById);

  // Approvals & Finalization
  app.post<{ Params: { id: string } }>('/:id/submit', { preHandler: [requirePermission(['PAYRUN_CALCULATE', 'PAYROLL_READ', 'REPORT_VIEW', 'EMPLOYEE_READ'])] }, payrunController.submitForApproval);
  app.post<{ Params: { id: string } }>('/:id/approve', { preHandler: [requirePermission(['PAYRUN_APPROVE', 'PAYROLL_READ', 'REPORT_VIEW', 'EMPLOYEE_READ'])] }, payrunController.approve);
  app.post<{ Params: { id: string } }>('/:id/reject', { preHandler: [requirePermission(['PAYRUN_APPROVE', 'PAYROLL_READ', 'REPORT_VIEW', 'EMPLOYEE_READ'])] }, payrunController.reject);
  app.post<{ Params: { id: string } }>('/:id/finalize', { preHandler: [requirePermission(['PAYRUN_APPROVE', 'PAYROLL_READ', 'REPORT_VIEW', 'EMPLOYEE_READ'])] }, payrunController.finalize);
}
