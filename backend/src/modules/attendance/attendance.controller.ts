import { FastifyReply, FastifyRequest } from 'fastify';
import { AttendanceService } from './attendance.service';
import { CheckInSchema, CheckOutSchema } from './attendance.schema';

export class AttendanceController {
  private attendanceService: AttendanceService;

  constructor() {
    this.attendanceService = new AttendanceService();
  }

  checkIn = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body || {}) as Record<string, unknown>;
    const employeeId = (body.employeeId as string) || request.user?.id || '';
    const date = (body.date as string) || new Date().toISOString();
    const checkInTime = (body.checkIn as string) || new Date().toISOString();

    const input = CheckInSchema.parse({
      employeeId,
      date,
      checkIn: checkInTime,
    });
    const orgId = request.user!.orgId;
    
    const result = await this.attendanceService.checkIn(orgId, input, request.user!.id);
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
    let { employeeId } = request.params;
    if (!employeeId || employeeId === 'undefined' || employeeId === 'me') {
      employeeId = request.user!.id;
    }
    
    const records = await this.attendanceService.getByEmployee(orgId, employeeId, request.user!.id);
    return reply.send({ success: true, data: records });
  };

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const permissions = request.user?.permissions || [];
    
    // If caller is Employee (has ATTENDANCE_SELF but not ATTENDANCE_READ), scope to own attendance records
    if (permissions.includes('ATTENDANCE_SELF') && !permissions.includes('ATTENDANCE_READ')) {
      const records = await this.attendanceService.getByEmployee(orgId, request.user!.id, request.user!.id);
      return reply.send({ success: true, data: records });
    }

    const records = await this.attendanceService.getAll(orgId);
    return reply.send({ success: true, data: records });
  };
}
