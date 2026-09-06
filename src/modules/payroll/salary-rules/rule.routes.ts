import { FastifyInstance } from 'fastify';
import { RuleController } from './rule.controller';
import { requirePermission } from '../../../middleware/auth';

export default async function ruleRoutes(app: FastifyInstance) {
  const ruleController = new RuleController();

  app.post('/', { preHandler: [requirePermission(['STRUCTURE_WRITE', 'PAYRUN_CALCULATE'])] }, ruleController.create);
  app.get<{ Params: { structureId: string } }>('/structure/:structureId', { preHandler: [requirePermission('PAYRUN_CALCULATE')] }, ruleController.getByStructureId);
}
