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

  // General check-out fallback endpoints
  app.post('/check-out', { preHandler: [requirePermission(['ATTENDANCE_UPDATE', 'ATTENDANCE_SELF'])] }, (req: any, reply: any) => attendanceController.checkOut({ ...req, params: { id: '' } }, reply));
  app.post('/checkout', { preHandler: [requirePermission(['ATTENDANCE_UPDATE', 'ATTENDANCE_SELF'])] }, (req: any, reply: any) => attendanceController.checkOut({ ...req, params: { id: '' } }, reply));

  app.get('/', { preHandler: [requirePermission(['ATTENDANCE_READ', 'ATTENDANCE_SELF'])] }, attendanceController.getAll);
  app.get<{ Params: { employeeId: string } }>('/employee/:employeeId', { preHandler: [requirePermission(['ATTENDANCE_READ', 'ATTENDANCE_SELF'])] }, attendanceController.getByEmployee);
}
