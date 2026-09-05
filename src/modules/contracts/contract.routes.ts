import { FastifyInstance } from 'fastify';
import { ContractController } from './contract.controller';
import { requirePermission } from '../../middleware/auth';

export default async function contractRoutes(app: FastifyInstance) {
  const contractController = new ContractController();

  app.post('/', { preHandler: [requirePermission('CONTRACT_CREATE')] }, contractController.create);
  app.get<{ Params: { employeeId: string } }>('/employee/:employeeId', { preHandler: [requirePermission('CONTRACT_READ')] }, contractController.getByEmployee);
}
