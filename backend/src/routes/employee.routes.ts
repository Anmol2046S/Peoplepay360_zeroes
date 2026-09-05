import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole, requireSelfOrRole } from '../middleware/rbac.middleware';
import { SystemRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

router.get('/', EmployeeController.getAllEmployees);
router.get(
  '/:id',
  requireSelfOrRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER], (req) => req.params.id),
  EmployeeController.getEmployeeById
);

router.post('/', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_MANAGER]), EmployeeController.createEmployee);
router.put('/:id', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_MANAGER]), EmployeeController.updateEmployee);

export default router;
