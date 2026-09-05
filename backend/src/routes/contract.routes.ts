import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { SystemRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// Employee role has NO contract access
router.get('/', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), ContractController.getAllContracts);
router.get('/:id', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), ContractController.getContractById);
router.post('/', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_MANAGER]), ContractController.createContract);

export default router;
