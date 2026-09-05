import { Router } from 'express';
import { SalaryRuleController } from '../controllers/salaryRule.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { SystemRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// HR Payroll User read only; HR Payroll Manager & Admin full CRUD
router.get('/', requireRole([SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), SalaryRuleController.getAllRules);
router.post('/', requireRole([SystemRole.HR_PAYROLL_MANAGER]), SalaryRuleController.createRule);
router.put('/:id', requireRole([SystemRole.HR_PAYROLL_MANAGER]), SalaryRuleController.updateRule);

export default router;
