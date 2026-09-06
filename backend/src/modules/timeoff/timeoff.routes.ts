import { FastifyInstance } from 'fastify';
import { TimeOffController } from './timeoff.controller';
import { requirePermission } from '../../middleware/auth';

export default async function timeOffRoutes(app: FastifyInstance) {
  const timeOffController = new TimeOffController();

  app.get<{ Querystring: { status?: string; employeeId?: string } }>('/requests', { preHandler: [requirePermission(['TIMEOFF_REQUEST', 'TIMEOFF_REQUEST_SELF', 'TIMEOFF_APPROVE', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, timeOffController.getRequests);
  app.get('/types', { preHandler: [requirePermission(['TIMEOFF_REQUEST', 'TIMEOFF_REQUEST_SELF', 'TIMEOFF_APPROVE', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, timeOffController.getTypes);
  app.get<{ Querystring: { employeeId?: string } }>('/allocations', { preHandler: [requirePermission(['TIMEOFF_REQUEST', 'TIMEOFF_REQUEST_SELF', 'TIMEOFF_APPROVE', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, timeOffController.getAllocations);

  app.post('/allocations', { preHandler: [requirePermission(['TIMEOFF_APPROVE', 'TIMEOFF_REQUEST', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, timeOffController.createAllocation);
  app.patch<{ Params: { id: string } }>('/allocations/:id', { preHandler: [requirePermission(['TIMEOFF_APPROVE', 'TIMEOFF_REQUEST', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, timeOffController.updateAllocation);
  app.put<{ Params: { id: string } }>('/allocations/:id', { preHandler: [requirePermission(['TIMEOFF_APPROVE', 'TIMEOFF_REQUEST', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, timeOffController.updateAllocation);
  app.delete<{ Params: { id: string } }>('/allocations/:id', { preHandler: [requirePermission(['TIMEOFF_APPROVE', 'TIMEOFF_REQUEST', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, timeOffController.deleteAllocation);

  app.post('/requests', { preHandler: [requirePermission(['TIMEOFF_REQUEST', 'TIMEOFF_REQUEST_SELF', 'TIMEOFF_APPROVE', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, timeOffController.requestTimeOff);
  app.post<{ Params: { id: string } }>('/requests/:id/approve', { preHandler: [requirePermission(['TIMEOFF_APPROVE', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, timeOffController.approve);
  app.post<{ Params: { id: string } }>('/requests/:id/reject', { preHandler: [requirePermission(['TIMEOFF_APPROVE', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, timeOffController.reject);
}
