import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { SystemRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// All authenticated users can read working schedules
router.get('/', ScheduleController.getAllSchedules);
router.get('/:id', ScheduleController.getScheduleById);
router.post('/', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_MANAGER]), ScheduleController.createSchedule);

export default router;
