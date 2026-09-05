import { FastifyInstance } from 'fastify';
import { AttendanceController } from './attendance.controller';
import { requirePermission } from '../../middleware/auth';

export default async function attendanceRoutes(app: FastifyInstance) {
  const attendanceController = new AttendanceController();

  app.post('/', { preHandler: [requirePermission('ATTENDANCE_CREATE')] }, attendanceController.checkIn);
  app.post('/check-in', { preHandler: [requirePermission('ATTENDANCE_CREATE')] }, attendanceController.checkIn);

  app.patch<{ Params: { id: string } }>('/:id/checkout', { preHandler: [requirePermission('ATTENDANCE_UPDATE')] }, attendanceController.checkOut);
  app.patch<{ Params: { id: string } }>('/:id/check-out', { preHandler: [requirePermission('ATTENDANCE_UPDATE')] }, attendanceController.checkOut);
  app.post<{ Params: { id: string } }>('/:id/check-out', { preHandler: [requirePermission('ATTENDANCE_UPDATE')] }, attendanceController.checkOut);
  app.post<{ Params: { id: string } }>('/:id/checkout', { preHandler: [requirePermission('ATTENDANCE_UPDATE')] }, attendanceController.checkOut);

  app.get('/', { preHandler: [requirePermission('ATTENDANCE_READ')] }, attendanceController.getAll);
  app.get<{ Params: { employeeId: string } }>('/employee/:employeeId', { preHandler: [requirePermission('ATTENDANCE_READ')] }, attendanceController.getByEmployee);
}
