"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payslip_controller_1 = require("../controllers/payslip.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/', payslip_controller_1.PayslipController.getAllPayslips);
router.get('/:id', payslip_controller_1.PayslipController.getPayslipById);
router.get('/:id/pdf', payslip_controller_1.PayslipController.getPayslipPdf);
exports.default = router;
//# sourceMappingURL=payslip.routes.js.map