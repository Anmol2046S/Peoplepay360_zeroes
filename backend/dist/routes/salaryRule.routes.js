"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const salaryRule_controller_1 = require("../controllers/salaryRule.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// HR Payroll User read only; HR Payroll Manager & Admin full CRUD
router.get('/', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_USER, client_1.SystemRole.HR_PAYROLL_MANAGER]), salaryRule_controller_1.SalaryRuleController.getAllRules);
router.post('/', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_MANAGER]), salaryRule_controller_1.SalaryRuleController.createRule);
router.put('/:id', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_MANAGER]), salaryRule_controller_1.SalaryRuleController.updateRule);
exports.default = router;
//# sourceMappingURL=salaryRule.routes.js.map