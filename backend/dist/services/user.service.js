"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const client_1 = require("@prisma/client");
class UserService {
    static async getAllUsers(search, role) {
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) {
            where.role = role;
        }
        const users = await database_1.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                createdAt: true,
                employee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        firstName: true,
                        lastName: true,
                        jobPosition: true,
                        department: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return users;
    }
    static async createUser(data) {
        const existing = await database_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new apiResponse_1.AppError(`User with email ${data.email} already exists.`, 400, 'USER_EXISTS');
        }
        if (data.employeeId) {
            const emp = await database_1.prisma.employee.findUnique({ where: { id: data.employeeId } });
            if (!emp) {
                throw new apiResponse_1.AppError('Linked employee record not found.', 404, 'EMPLOYEE_NOT_FOUND');
            }
        }
        const passwordToUse = data.password || 'Password123!';
        const passwordHash = await bcryptjs_1.default.hash(passwordToUse, 10);
        const user = await database_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                role: data.role,
                status: client_1.AccountStatus.ACTIVE,
                employeeId: data.employeeId || null,
            },
            include: {
                employee: true,
            },
        });
        return user;
    }
    static async updateUser(id, data) {
        const user = await database_1.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new apiResponse_1.AppError('User not found.', 404, 'USER_NOT_FOUND');
        }
        const updated = await database_1.prisma.user.update({
            where: { id },
            data: {
                name: data.name !== undefined ? data.name : user.name,
                role: data.role !== undefined ? data.role : user.role,
                status: data.status !== undefined ? data.status : user.status,
                employeeId: data.employeeId !== undefined ? data.employeeId : user.employeeId,
            },
        });
        return updated;
    }
    static async resetPassword(id, newPasswordStr) {
        const user = await database_1.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new apiResponse_1.AppError('User not found.', 404, 'USER_NOT_FOUND');
        }
        if (!newPasswordStr || newPasswordStr.length < 6) {
            throw new apiResponse_1.AppError('Password must be at least 6 characters long.', 400, 'INVALID_PASSWORD');
        }
        const passwordHash = await bcryptjs_1.default.hash(newPasswordStr, 10);
        await database_1.prisma.user.update({
            where: { id },
            data: { passwordHash },
        });
        return { id: user.id, email: user.email };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map