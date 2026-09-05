"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payrun_controller_1 = require("../controllers/payrun.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// HR Payroll User & Manager read access
router.get('/', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_USER, client_1.SystemRole.HR_PAYROLL_MANAGER]), payrun_controller_1.PayrunController.getAllPayruns);
router.get('/:id', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_USER, client_1.SystemRole.HR_PAYROLL_MANAGER]), payrun_controller_1.PayrunController.getPayrunById);
// Payrun Wizard Step 2 Eligible Employees lookup
router.post('/eligible-employees', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_USER, client_1.SystemRole.HR_PAYROLL_MANAGER]), payrun_controller_1.PayrunController.getEligibleEmployees);
// Payrun Initialization
router.post('/', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_USER, client_1.SystemRole.HR_PAYROLL_MANAGER]), payrun_controller_1.PayrunController.createPayrun);
// Payrun Actions
router.post('/:id/compute', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_USER, client_1.SystemRole.HR_PAYROLL_MANAGER]), payrun_controller_1.PayrunController.computePayrun);
router.post('/:id/validate', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_USER, client_1.SystemRole.HR_PAYROLL_MANAGER]), payrun_controller_1.PayrunController.validatePayrun);
// Mark Paid & Bulk Email - Restricted to HR Payroll Manager & Admin
router.post('/:id/mark-paid', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_MANAGER]), payrun_controller_1.PayrunController.markPaid);
router.post('/:id/send-payslips', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_MANAGER]), payrun_controller_1.PayrunController.sendPayslips);
exports.default = router;
//# sourceMappingURL=payrun.routes.js.map