"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
class UserController {
    userService;
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    getAllUsers = async (request, reply) => {
        const orgId = request.user.orgId;
        const query = (request.query || {});
        const users = await this.userService.getAllUsers(orgId, query.search, query.role);
        return reply.send({ success: true, data: users });
    };
    createUser = async (request, reply) => {
        const orgId = request.user.orgId;
        const body = (request.body || {});
        const user = await this.userService.createUser(orgId, body);
        return reply.status(201).send({ success: true, data: user });
    };
    updateUser = async (request, reply) => {
        const orgId = request.user.orgId;
        const { id } = request.params;
        const body = (request.body || {});
        const user = await this.userService.updateUser(orgId, id, body);
        return reply.send({ success: true, data: user });
    };
    resetPassword = async (request, reply) => {
        const orgId = request.user.orgId;
        const { id } = request.params;
        const body = (request.body || {});
        const newPassword = body.newPassword || body.password || '';
        const result = await this.userService.resetPassword(orgId, id, newPassword);
        return reply.send({ success: true, data: result, message: 'Password reset successfully' });
    };
}
exports.UserController = UserController;
