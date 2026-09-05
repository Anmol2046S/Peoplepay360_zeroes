import { Router } from 'express';
import { SalaryStructureController } from '../controllers/salaryStructure.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { SystemRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// HR Payroll User has READ ONLY access; HR Payroll Manager & Admin have full CRUD
router.get('/', requireRole([SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), SalaryStructureController.getAllStructures);
router.get('/:id', requireRole([SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), SalaryStructureController.getStructureById);
router.post('/', requireRole([SystemRole.HR_PAYROLL_MANAGER]), SalaryStructureController.createStructure);

export default router;
