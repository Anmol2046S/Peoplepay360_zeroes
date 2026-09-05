"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const apiResponse_1 = require("../utils/apiResponse");
const zod_1 = require("zod");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Valid work email is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
class AuthController {
    static async login(req, res, next) {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const result = await auth_service_1.AuthService.login(email, password);
            return (0, apiResponse_1.sendSuccess)(res, result, 'Authenticated successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getMe(req, res, next) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const user = await auth_service_1.AuthService.getMe(req.user.id);
            return (0, apiResponse_1.sendSuccess)(res, user, 'Current user profile fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map