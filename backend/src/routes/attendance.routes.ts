import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { SystemRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

router.get('/active-session', AttendanceController.getActiveSession);
router.post('/check-in', AttendanceController.checkIn);
router.post('/check-out', AttendanceController.checkOut);
router.get('/', AttendanceController.getAllAttendance);

// Manual administrative corrections restricted to HR/Admin roles
router.put('/:id', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), AttendanceController.updateAttendance);

export default router;
