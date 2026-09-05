import { Router } from 'express';
import { PayslipController } from '../controllers/payslip.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', PayslipController.getAllPayslips);
router.get('/:id', PayslipController.getPayslipById);
router.get('/:id/pdf', PayslipController.getPayslipPdf);

export default router;
