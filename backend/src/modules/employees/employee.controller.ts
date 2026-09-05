import { FastifyReply, FastifyRequest } from 'fastify';
import { EmployeeService } from './employee.service';
import { CreateEmployeeSchema, UpdateEmployeeSchema } from './employee.schema';

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = CreateEmployeeSchema.parse(request.body);
    const orgId = request.user!.orgId;
    const employee = await this.employeeService.create(orgId, input);
    return reply.status(201).send({ success: true, data: employee });
  };

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const permissions = request.user?.permissions || [];
    
    const employees = await this.employeeService.getAll(orgId);
    if (!permissions.includes('EMPLOYEE_READ')) {
      const selfEmp = employees.filter((e: any) => e.userId === request.user!.id);
      return reply.send({ success: true, data: selfEmp });
    }
    
    return reply.send({ success: true, data: employees });
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const employee = await this.employeeService.getById(orgId, id);
    return reply.send({ success: true, data: employee });
  };

  update = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const input = UpdateEmployeeSchema.parse(request.body);
    const employee = await this.employeeService.update(orgId, id, input);
    return reply.send({ success: true, data: employee });
  };
}
