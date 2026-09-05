"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const auth_controller_1 = require("./auth.controller");
const auth_1 = require("../../middleware/auth");
async function authRoutes(app) {
    const authController = new auth_controller_1.AuthController();
    app.post('/login', authController.login);
    app.get('/me', { preHandler: [auth_1.requireAuth] }, authController.me);
}
