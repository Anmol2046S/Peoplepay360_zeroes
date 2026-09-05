import { FastifyInstance } from 'fastify';
import { TimeOffController } from './timeoff.controller';
import { requirePermission } from '../../middleware/auth';

export default async function timeOffRoutes(app: FastifyInstance) {
  const timeOffController = new TimeOffController();

  app.post('/requests', { preHandler: [requirePermission('TIMEOFF_REQUEST')] }, timeOffController.requestTimeOff);
  app.post<{ Params: { id: string } }>('/requests/:id/approve', { preHandler: [requirePermission('TIMEOFF_APPROVE')] }, timeOffController.approve);
  app.post<{ Params: { id: string } }>('/requests/:id/reject', { preHandler: [requirePermission('TIMEOFF_APPROVE')] }, timeOffController.reject);
}
