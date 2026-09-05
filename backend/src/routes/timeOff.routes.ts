import { Router } from 'express';
import { TimeOffController } from '../controllers/timeOff.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { SystemRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// Types
router.get('/types', TimeOffController.getAllTypes);
router.post('/types', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_MANAGER]), TimeOffController.createType);

// Allocations
router.get('/allocations', TimeOffController.getAllAllocations);
router.post('/allocations', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_MANAGER]), TimeOffController.createAllocation);

// Requests
router.get('/requests', TimeOffController.getAllRequests);
router.post('/requests', TimeOffController.createRequest);
router.put('/requests/:id/approve', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_MANAGER]), TimeOffController.approveRequest);
router.put('/requests/:id/refuse', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_MANAGER]), TimeOffController.refuseRequest);

export default router;
