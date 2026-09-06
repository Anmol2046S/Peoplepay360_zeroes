import { FastifyInstance } from 'fastify';
import { StructureController } from './structure.controller';
import { requirePermission } from '../../../middleware/auth';

export default async function structureRoutes(app: FastifyInstance) {
  const structureController = new StructureController();

  app.post('/', { preHandler: [requirePermission(['STRUCTURE_WRITE', 'REPORT_VIEW', 'EMPLOYEE_READ', 'PAYRUN_CALCULATE'])] }, structureController.create);
  app.get('/', { preHandler: [requirePermission(['STRUCTURE_READ', 'REPORT_VIEW', 'EMPLOYEE_READ', 'PAYRUN_CALCULATE'])] }, structureController.getAll);
  app.get<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission(['STRUCTURE_READ', 'REPORT_VIEW', 'EMPLOYEE_READ', 'PAYRUN_CALCULATE'])] }, structureController.getById);
  app.patch<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission(['STRUCTURE_WRITE', 'REPORT_VIEW', 'EMPLOYEE_READ', 'PAYRUN_CALCULATE'])] }, structureController.update);
  app.put<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission(['STRUCTURE_WRITE', 'REPORT_VIEW', 'EMPLOYEE_READ', 'PAYRUN_CALCULATE'])] }, structureController.update);
}
