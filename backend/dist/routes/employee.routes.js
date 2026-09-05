"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_controller_1 = require("../controllers/employee.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/', employee_controller_1.EmployeeController.getAllEmployees);
router.get('/:id', (0, rbac_middleware_1.requireSelfOrRole)([client_1.SystemRole.HR_MANAGER, client_1.SystemRole.HR_PAYROLL_USER, client_1.SystemRole.HR_PAYROLL_MANAGER], (req) => req.params.id), employee_controller_1.EmployeeController.getEmployeeById);
router.post('/', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_MANAGER, client_1.SystemRole.HR_PAYROLL_MANAGER]), employee_controller_1.EmployeeController.createEmployee);
router.put('/:id', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_MANAGER, client_1.SystemRole.HR_PAYROLL_MANAGER]), employee_controller_1.EmployeeController.updateEmployee);
exports.default = router;
//# sourceMappingURL=employee.routes.js.map