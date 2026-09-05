"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const timeOff_controller_1 = require("../controllers/timeOff.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
const adminReadOnlyNotice = 'Admin Portal access to Time Off Requests and Allocations is strictly read-only.';
// Types
router.get('/types', timeOff_controller_1.TimeOffController.getAllTypes);
router.post('/types', (0, rbac_middleware_1.forbidRole)([client_1.SystemRole.ADMIN], adminReadOnlyNotice), (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_MANAGER, client_1.SystemRole.HR_PAYROLL_MANAGER]), timeOff_controller_1.TimeOffController.createType);
// Allocations
router.get('/allocations', timeOff_controller_1.TimeOffController.getAllAllocations);
router.get('/allocations/:id', timeOff_controller_1.TimeOffController.getAllocationById);
router.post('/allocations', (0, rbac_middleware_1.forbidRole)([client_1.SystemRole.ADMIN], adminReadOnlyNotice), (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_MANAGER, client_1.SystemRole.HR_PAYROLL_MANAGER]), timeOff_controller_1.TimeOffController.createAllocation);
// Requests
router.get('/requests', timeOff_controller_1.TimeOffController.getAllRequests);
router.get('/requests/:id', timeOff_controller_1.TimeOffController.getRequestById);
router.post('/requests', (0, rbac_middleware_1.forbidRole)([client_1.SystemRole.ADMIN], adminReadOnlyNotice), timeOff_controller_1.TimeOffController.createRequest);
router.put('/requests/:id/approve', (0, rbac_middleware_1.forbidRole)([client_1.SystemRole.ADMIN], adminReadOnlyNotice), (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_MANAGER, client_1.SystemRole.HR_PAYROLL_MANAGER]), timeOff_controller_1.TimeOffController.approveRequest);
router.put('/requests/:id/refuse', (0, rbac_middleware_1.forbidRole)([client_1.SystemRole.ADMIN], adminReadOnlyNotice), (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_MANAGER, client_1.SystemRole.HR_PAYROLL_MANAGER]), timeOff_controller_1.TimeOffController.refuseRequest);
exports.default = router;
//# sourceMappingURL=timeOff.routes.js.map