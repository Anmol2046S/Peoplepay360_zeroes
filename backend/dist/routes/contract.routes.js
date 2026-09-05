"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contract_controller_1 = require("../controllers/contract.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Employee role has NO contract access
router.get('/', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_MANAGER, client_1.SystemRole.HR_PAYROLL_USER, client_1.SystemRole.HR_PAYROLL_MANAGER]), contract_controller_1.ContractController.getAllContracts);
router.get('/:id', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_MANAGER, client_1.SystemRole.HR_PAYROLL_USER, client_1.SystemRole.HR_PAYROLL_MANAGER]), contract_controller_1.ContractController.getContractById);
router.post('/', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_MANAGER, client_1.SystemRole.HR_PAYROLL_MANAGER]), contract_controller_1.ContractController.createContract);
exports.default = router;
//# sourceMappingURL=contract.routes.js.map