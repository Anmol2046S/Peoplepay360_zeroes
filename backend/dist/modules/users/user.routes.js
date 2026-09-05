"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userRoutes;
const user_controller_1 = require("./user.controller");
const auth_1 = require("../../middleware/auth");
async function userRoutes(app) {
    const userController = new user_controller_1.UserController();
    app.get('/', { preHandler: [(0, auth_1.requirePermission)('USER_MANAGE')] }, userController.getAllUsers);
    app.post('/', { preHandler: [(0, auth_1.requirePermission)('USER_MANAGE')] }, userController.createUser);
    app.patch('/:id', { preHandler: [(0, auth_1.requirePermission)('USER_MANAGE')] }, userController.updateUser);
    app.post('/:id/reset-password', { preHandler: [(0, auth_1.requirePermission)('USER_MANAGE')] }, userController.resetPassword);
}
