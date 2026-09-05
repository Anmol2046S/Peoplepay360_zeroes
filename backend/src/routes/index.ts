import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import employeeRoutes from './employee.routes';
import contractRoutes from './contract.routes';
import scheduleRoutes from './schedule.routes';
import attendanceRoutes from './attendance.routes';
import timeOffRoutes from './timeOff.routes';
import salaryStructureRoutes from './salaryStructure.routes';
import salaryRuleRoutes from './salaryRule.routes';
import payrunRoutes from './payrun.routes';
import payslipRoutes from './payslip.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);
router.use('/contracts', contractRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/time-off', timeOffRoutes);
router.use('/salary-structures', salaryStructureRoutes);
router.use('/salary-rules', salaryRuleRoutes);
router.use('/payruns', payrunRoutes);
router.use('/payslips', payslipRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
