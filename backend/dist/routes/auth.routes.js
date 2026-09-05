"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimiter_middleware_1 = require("../middleware/rateLimiter.middleware");
const router = (0, express_1.Router)();
router.post('/login', rateLimiter_middleware_1.authRateLimiter, auth_controller_1.AuthController.login);
router.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.AuthController.getMe);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map