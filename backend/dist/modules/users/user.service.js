"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../../database/db");
const apiResponse_1 = require("../../utils/apiResponse");
class UserService {
    async getAllUsers(orgId, search, role) {
        const where = { orgId };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) {
            where.roleName = role;
        }
        const users = await db_1.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                roleName: true,
                status: true,
                createdAt: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        permissions: true,
                    },
                },
                employees: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        jobTitle: true,
                        department: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return users;
    }
    async createUser(orgId, data) {
        const existing = await db_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new apiResponse_1.AppError(`User with email ${data.email} already exists.`, 400, 'USER_EXISTS');
        }
        let defaultRole = await db_1.prisma.role.findFirst({
            where: { name: 'SUPER_ADMIN' },
        });
        if (!defaultRole) {
            defaultRole = await db_1.prisma.role.create({
                data: {
                    name: 'SUPER_ADMIN',
                    permissions: ['EMPLOYEE_CREATE', 'EMPLOYEE_READ', 'EMPLOYEE_UPDATE', 'ATTENDANCE_READ', 'PAYRUN_READ'],
                },
            });
        }
        const passwordToUse = data.password || 'Password123!';
        const passwordHash = await bcryptjs_1.default.hash(passwordToUse, 10);
        const user = await db_1.prisma.user.create({
            data: {
                orgId,
                name: data.name,
                email: data.email,
                passwordHash,
                roleId: defaultRole.id,
                status: 'ACTIVE',
            },
            include: {
                role: true,
            },
        });
        if (data.employeeId) {
            await db_1.prisma.employee.update({
                where: { id: data.employeeId },
                data: { userId: user.id },
            });
        }
        return user;
    }
    async updateUser(orgId, id, data) {
        const user = await db_1.prisma.user.findFirst({ where: { id, orgId } });
        if (!user) {
            throw new apiResponse_1.AppError('User not found.', 404, 'USER_NOT_FOUND');
        }
        const updated = await db_1.prisma.user.update({
            where: { id },
            data: {
                name: data.name !== undefined ? data.name : user.name,
                status: data.status !== undefined ? data.status : user.status,
            },
        });
        return updated;
    }
    async resetPassword(orgId, id, newPasswordStr) {
        const user = await db_1.prisma.user.findFirst({ where: { id, orgId } });
        if (!user) {
            throw new apiResponse_1.AppError('User not found.', 404, 'USER_NOT_FOUND');
        }
        if (!newPasswordStr || newPasswordStr.length < 6) {
            throw new apiResponse_1.AppError('Password must be at least 6 characters long.', 400, 'INVALID_PASSWORD');
        }
        const passwordHash = await bcryptjs_1.default.hash(newPasswordStr, 10);
        await db_1.prisma.user.update({
            where: { id },
            data: { passwordHash },
        });
        return { id: user.id, email: user.email };
    }
}
exports.UserService = UserService;
