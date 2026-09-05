import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { AppError } from '../utils/apiResponse';
import { SystemRole, AccountStatus } from '@prisma/client';

export class UserService {
  static async getAllUsers(search?: string, role?: SystemRole) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
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

  static async createUser(data: { name: string; email: string; password?: string; role: SystemRole; employeeId?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError(`User with email ${data.email} already exists.`, 400, 'USER_EXISTS');
    }

    if (data.employeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: data.employeeId } });
      if (!emp) {
        throw new AppError('Linked employee record not found.', 404, 'EMPLOYEE_NOT_FOUND');
      }
    }

    const passwordToUse = data.password || 'Password123!';
    const passwordHash = await bcrypt.hash(passwordToUse, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        status: AccountStatus.ACTIVE,
        employeeId: data.employeeId || null,
      },
      include: {
        employee: true,
      },
    });

    return user;
  }

  static async updateUser(id: string, data: { name?: string; role?: SystemRole; status?: AccountStatus; employeeId?: string }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    const updated = await prisma.user.update({
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

  static async resetPassword(id: string, newPasswordStr: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    if (!newPasswordStr || newPasswordStr.length < 6) {
      throw new AppError('Password must be at least 6 characters long.', 400, 'INVALID_PASSWORD');
    }

    const passwordHash = await bcrypt.hash(newPasswordStr, 10);
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return { id: user.id, email: user.email };
  }
}
