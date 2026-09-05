"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const auth_schema_1 = require("./auth.schema");
class AuthController {
    authService;
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    login = async (request, reply) => {
        const input = auth_schema_1.LoginSchema.parse(request.body);
        const result = await this.authService.login(input);
        return reply.send({
            success: true,
            data: result,
        });
    };
    me = async (request, reply) => {
        return reply.send({
            success: true,
            data: request.user,
        });
    };
}
exports.AuthController = AuthController;
