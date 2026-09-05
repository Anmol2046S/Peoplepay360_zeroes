"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const jwt_1 = require("../config/jwt");
const apiResponse_1 = require("../utils/apiResponse");
class AuthService {
    static async login(email, passwordStr) {
        const user = await database_1.prisma.user.findUnique({
            where: { email },
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        firstName: true,
                        lastName: true,
                        department: { select: { name: true } },
                    },
                },
            },
        });
        if (!user) {
            throw new apiResponse_1.AppError('Invalid work email or password.', 401, 'INVALID_CREDENTIALS');
        }
        if (user.status !== 'ACTIVE') {
            throw new apiResponse_1.AppError('Account is inactive or suspended. Please contact administrator.', 403, 'ACCOUNT_INACTIVE');
        }
        const isMatch = await bcryptjs_1.default.compare(passwordStr, user.passwordHash);
        if (!isMatch) {
            throw new apiResponse_1.AppError('Invalid work email or password.', 401, 'INVALID_CREDENTIALS');
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            employeeId: user.employeeId,
        };
        const token = jsonwebtoken_1.default.sign(payload, jwt_1.jwtConfig.secret, {
            expiresIn: jwt_1.jwtConfig.expiresIn,
        });
        // Log login action
        await database_1.prisma.auditLog.create({
            data: {
                action: 'USER_LOGIN',
                entity: 'User',
                entityId: user.id,
                details: `Successful login for ${user.email} (${user.role})`,
                userId: user.id,
            },
        });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                employeeId: user.employeeId,
                employee: user.employee || null,
            },
        };
    }
    static async getMe(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        firstName: true,
                        lastName: true,
                        department: { select: { name: true } },
                    },
                },
            },
        });
        if (!user || user.status !== 'ACTIVE') {
            throw new apiResponse_1.AppError('User session invalid or account inactive.', 401, 'UNAUTHORIZED');
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            employeeId: user.employeeId,
            employee: user.employee || null,
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map