"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../database/db");
const errors_1 = require("../../shared/errors");
class AuthService {
    async login(input) {
        const user = await db_1.prisma.user.findUnique({
            where: { email: input.email },
            include: { role: true },
        });
        if (!user || user.status !== 'ACTIVE') {
            throw new errors_1.UnauthorizedError('Invalid credentials or inactive account');
        }
        const isValidPassword = await bcryptjs_1.default.compare(input.password, user.passwordHash);
        if (!isValidPassword) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        const secret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            orgId: user.orgId,
            email: user.email,
            roleId: user.roleId,
            permissions: user.role.permissions,
        }, secret, { expiresIn: '8h' });
        return {
            token,
            user: {
                id: user.id,
                orgId: user.orgId,
                email: user.email,
                role: user.role.name,
            },
        };
    }
}
exports.AuthService = AuthService;
