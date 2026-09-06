import { FastifyInstance } from 'fastify';
import { ContractController } from './contract.controller';
import { requirePermission } from '../../middleware/auth';

export default async function contractRoutes(app: FastifyInstance) {
  const contractController = new ContractController();

  app.get('/', { preHandler: [requirePermission(['CONTRACT_READ', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, contractController.getAll);
  app.get<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission(['CONTRACT_READ', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, contractController.getById);
  app.get<{ Params: { employeeId: string } }>('/employee/:employeeId', { preHandler: [requirePermission(['CONTRACT_READ', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, contractController.getByEmployee);

  app.post('/', { preHandler: [requirePermission(['CONTRACT_CREATE', 'CONTRACT_READ', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, contractController.create);
  app.patch<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission(['CONTRACT_UPDATE', 'CONTRACT_READ', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, contractController.update);
  app.put<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission(['CONTRACT_UPDATE', 'CONTRACT_READ', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, contractController.update);
  app.delete<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission(['CONTRACT_UPDATE', 'CONTRACT_CREATE', 'EMPLOYEE_READ', 'REPORT_VIEW'])] }, contractController.delete);
}
