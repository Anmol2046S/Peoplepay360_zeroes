import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { SystemRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// Restricted to HR / Payroll / Admin roles
router.get('/metrics', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), DashboardController.getMetrics);
router.get('/department-costs', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), DashboardController.getDepartmentCosts);
router.get('/salary-trend', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), DashboardController.getSalaryTrend);
router.get('/alerts', requireRole([SystemRole.HR_MANAGER, SystemRole.HR_PAYROLL_USER, SystemRole.HR_PAYROLL_MANAGER]), DashboardController.getAlerts);

export default router;
