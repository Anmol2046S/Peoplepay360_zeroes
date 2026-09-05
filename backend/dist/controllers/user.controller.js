"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const apiResponse_1 = require("../utils/apiResponse");
class UserController {
    static async getAllUsers(req, res, next) {
        try {
            const search = req.query.search;
            const role = req.query.role;
            const users = await user_service_1.UserService.getAllUsers(search, role);
            return (0, apiResponse_1.sendSuccess)(res, users, 'Users fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async createUser(req, res, next) {
        try {
            const newUser = await user_service_1.UserService.createUser(req.body);
            return (0, apiResponse_1.sendSuccess)(res, newUser, 'User account created successfully', 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async updateUser(req, res, next) {
        try {
            const id = req.params.id;
            const updated = await user_service_1.UserService.updateUser(id, req.body);
            return (0, apiResponse_1.sendSuccess)(res, updated, 'User updated successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const id = req.params.id;
            const newPassword = req.body.newPassword || req.body.password;
            if (!newPassword) {
                throw new apiResponse_1.AppError('New password is required.', 400, 'PASSWORD_REQUIRED');
            }
            const result = await user_service_1.UserService.resetPassword(id, newPassword);
            return (0, apiResponse_1.sendSuccess)(res, result, 'User password reset successfully');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map