import { Router } from 'express';
import { PayrunController } from '../controllers/payrun.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { SystemRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// HR Payroll User & Manager read access
router.get('/', requireRole([SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), PayrunController.getAllPayruns);
router.get('/:id', requireRole([SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), PayrunController.getPayrunById);

// Payrun Wizard Step 2 Eligible Employees lookup
router.post('/eligible-employees', requireRole([SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), PayrunController.getEligibleEmployees);

// Payrun Initialization
router.post('/', requireRole([SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), PayrunController.createPayrun);

// Payrun Actions
router.post('/:id/compute', requireRole([SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), PayrunController.computePayrun);
router.post('/:id/validate', requireRole([SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), PayrunController.validatePayrun);

// Mark Paid & Bulk Email - Restricted to HR Payroll Manager & Admin
router.post('/:id/mark-paid', requireRole([SystemRole.HR_PAYROLL_MANAGER]), PayrunController.markPaid);
router.post('/:id/send-payslips', requireRole([SystemRole.HR_PAYROLL_MANAGER]), PayrunController.sendPayslips);

export default router;
