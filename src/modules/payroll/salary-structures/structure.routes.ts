import { FastifyInstance } from 'fastify';
import { StructureController } from './structure.controller';
import { requirePermission } from '../../../middleware/auth';

export default async function structureRoutes(app: FastifyInstance) {
  const structureController = new StructureController();

  // Assuming HR_MANAGER or ADMIN can create structures. Permission could be 'STRUCTURE_CREATE' or similar.
  app.post('/', { preHandler: [requirePermission('PAYRUN_CALCULATE')] }, structureController.create);
  app.get('/', { preHandler: [requirePermission('PAYRUN_CALCULATE')] }, structureController.getAll);
  app.get<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission('PAYRUN_CALCULATE')] }, structureController.getById);
  app.patch<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission('PAYRUN_CALCULATE')] }, structureController.update);
}
