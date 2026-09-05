import { FastifyInstance } from 'fastify';
import { EmployeeController } from './employee.controller';
import { requirePermission } from '../../middleware/auth';

export default async function employeeRoutes(app: FastifyInstance) {
  const employeeController = new EmployeeController();

  app.post('/', { preHandler: [requirePermission('EMPLOYEE_CREATE')] }, employeeController.create);
  app.get('/', { preHandler: [requirePermission(['EMPLOYEE_READ', 'ATTENDANCE_SELF', 'TIMEOFF_REQUEST_SELF', 'PAYSLIP_READ_SELF'])] }, employeeController.getAll);
  app.get<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission(['EMPLOYEE_READ', 'ATTENDANCE_SELF', 'TIMEOFF_REQUEST_SELF', 'PAYSLIP_READ_SELF'])] }, employeeController.getById);
  app.patch<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission('EMPLOYEE_UPDATE')] }, employeeController.update);
}
