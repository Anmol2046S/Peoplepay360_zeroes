import { FastifyInstance } from 'fastify';
import { AttendanceController } from './attendance.controller';
import { requirePermission } from '../../middleware/auth';

export default async function attendanceRoutes(app: FastifyInstance) {
  const attendanceController = new AttendanceController();

  app.post('/', { preHandler: [requirePermission(['ATTENDANCE_CREATE', 'ATTENDANCE_SELF'])] }, attendanceController.checkIn);
  app.post('/check-in', { preHandler: [requirePermission(['ATTENDANCE_CREATE', 'ATTENDANCE_SELF'])] }, attendanceController.checkIn);

  app.patch<{ Params: { id: string } }>('/:id/checkout', { preHandler: [requirePermission(['ATTENDANCE_UPDATE', 'ATTENDANCE_SELF'])] }, attendanceController.checkOut);
  app.patch<{ Params: { id: string } }>('/:id/check-out', { preHandler: [requirePermission(['ATTENDANCE_UPDATE', 'ATTENDANCE_SELF'])] }, attendanceController.checkOut);
  app.post<{ Params: { id: string } }>('/:id/check-out', { preHandler: [requirePermission(['ATTENDANCE_UPDATE', 'ATTENDANCE_SELF'])] }, attendanceController.checkOut);
  app.post<{ Params: { id: string } }>('/:id/checkout', { preHandler: [requirePermission(['ATTENDANCE_UPDATE', 'ATTENDANCE_SELF'])] }, attendanceController.checkOut);

  app.get('/', { preHandler: [requirePermission(['ATTENDANCE_READ', 'ATTENDANCE_SELF'])] }, attendanceController.getAll);
  app.get<{ Params: { employeeId: string } }>('/employee/:employeeId', { preHandler: [requirePermission(['ATTENDANCE_READ', 'ATTENDANCE_SELF'])] }, attendanceController.getByEmployee);
}
