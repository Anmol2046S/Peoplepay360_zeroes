"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Only ADMIN can manage users and reset passwords
router.get('/', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.ADMIN]), user_controller_1.UserController.getAllUsers);
router.post('/', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.ADMIN]), user_controller_1.UserController.createUser);
router.put('/:id', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.ADMIN]), user_controller_1.UserController.updateUser);
router.post('/:id/reset-password', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.ADMIN]), user_controller_1.UserController.resetPassword);
exports.default = router;
//# sourceMappingURL=user.routes.js.map