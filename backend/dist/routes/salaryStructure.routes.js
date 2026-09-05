"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const salaryStructure_controller_1 = require("../controllers/salaryStructure.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// HR Payroll User has READ ONLY access; HR Payroll Manager & Admin have full CRUD
router.get('/', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_USER, client_1.SystemRole.HR_PAYROLL_MANAGER]), salaryStructure_controller_1.SalaryStructureController.getAllStructures);
router.get('/:id', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_USER, client_1.SystemRole.HR_PAYROLL_MANAGER]), salaryStructure_controller_1.SalaryStructureController.getStructureById);
router.post('/', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_PAYROLL_MANAGER]), salaryStructure_controller_1.SalaryStructureController.createStructure);
exports.default = router;
//# sourceMappingURL=salaryStructure.routes.js.map