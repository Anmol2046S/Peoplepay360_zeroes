import { Router } from 'express';
import { TimeOffController } from '../controllers/timeOff.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole, forbidRole } from '../middleware/rbac.middleware';
import { SystemRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

const adminReadOnlyNotice = 'Admin Portal access to Time Off Requests and Allocations is strictly read-only.';

// Types
router.get('/types', TimeOffController.getAllTypes);
router.post('/types', forbidRole([SystemRole.ADMIN], adminReadOnlyNotice), requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_MANAGER]), TimeOffController.createType);

// Allocations
router.get('/allocations', TimeOffController.getAllAllocations);
router.get('/allocations/:id', TimeOffController.getAllocationById);
router.post('/allocations', forbidRole([SystemRole.ADMIN], adminReadOnlyNotice), requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_MANAGER]), TimeOffController.createAllocation);

// Requests
router.get('/requests', TimeOffController.getAllRequests);
router.get('/requests/:id', TimeOffController.getRequestById);
router.post('/requests', forbidRole([SystemRole.ADMIN], adminReadOnlyNotice), TimeOffController.createRequest);
router.put('/requests/:id/approve', forbidRole([SystemRole.ADMIN], adminReadOnlyNotice), requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_MANAGER]), TimeOffController.approveRequest);
router.put('/requests/:id/refuse', forbidRole([SystemRole.ADMIN], adminReadOnlyNotice), requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_MANAGER]), TimeOffController.refuseRequest);

export default router;
