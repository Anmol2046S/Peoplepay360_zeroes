import { FastifyInstance } from 'fastify';
import { EngineController } from './engine.controller';
import { requirePermission } from '../../../middleware/auth';

export default async function engineRoutes(app: FastifyInstance) {
  const engineController = new EngineController();

  app.post<{ Params: { payrunId: string } }>('/:payrunId/calculate', { preHandler: [requirePermission('PAYRUN_CALCULATE')] }, engineController.calculate);
}
