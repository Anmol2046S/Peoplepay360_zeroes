import { FastifyReply, FastifyRequest } from 'fastify';
import { AttendanceService } from './attendance.service';
import { CheckInSchema, CheckOutSchema } from './attendance.schema';

export class AttendanceController {
  private attendanceService: AttendanceService;

  constructor() {
    this.attendanceService = new AttendanceService();
  }

  checkIn = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = CheckInSchema.parse(request.body);
    const orgId = request.user!.orgId;
    
    // In a real app, an employee role should only be able to check-in for themselves.
    // Assuming higher roles can create for anyone.
    const result = await this.attendanceService.checkIn(orgId, input);
    return reply.status(201).send({ success: true, data: result });
  };

  checkOut = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const input = CheckOutSchema.parse(request.body);
    const orgId = request.user!.orgId;
    const { id } = request.params;

    const result = await this.attendanceService.checkOut(orgId, id, input);
    return reply.send({ success: true, data: result });
  };

  getByEmployee = async (request: FastifyRequest<{ Params: { employeeId: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { employeeId } = request.params;
    
    const records = await this.attendanceService.getByEmployee(orgId, employeeId);
    return reply.send({ success: true, data: records });
  };

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const records = await this.attendanceService.getAll(orgId);
    return reply.send({ success: true, data: records });
  };
}
