import { FastifyInstance } from 'fastify';
import { DashboardController } from './dashboard.controller';
import { requireAuth } from '../../middleware/auth';

export default async function dashboardRoutes(app: FastifyInstance) {
  const dashboardController = new DashboardController();

  app.get('/metrics', { preHandler: [requireAuth] }, dashboardController.getMetrics.bind(dashboardController));
}
