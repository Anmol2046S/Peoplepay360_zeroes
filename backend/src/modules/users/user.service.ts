import bcrypt from 'bcryptjs';
import { prisma } from '../../database/db';
import { AppError } from '../../utils/apiResponse';

export class UserService {
  async getAllUsers(orgId: string, search?: string, role?: string) {
    const where: any = { orgId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.roleName = role;
    }

    const users = await prisma.user.findMany({
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

  async createUser(orgId: string, data: { name: string; email: string; password?: string; role?: string; employeeId?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError(`User with email ${data.email} already exists.`, 400, 'USER_EXISTS');
    }

    let defaultRole = await prisma.role.findFirst({
      where: { name: 'SUPER_ADMIN' },
    });

    if (!defaultRole) {
      defaultRole = await prisma.role.create({
        data: {
          name: 'SUPER_ADMIN',
          permissions: ['EMPLOYEE_CREATE', 'EMPLOYEE_READ', 'EMPLOYEE_UPDATE', 'ATTENDANCE_READ', 'PAYRUN_READ'],
        },
      });
    }

    const passwordToUse = data.password || 'Password123!';
    const passwordHash = await bcrypt.hash(passwordToUse, 10);

    const user = await prisma.user.create({
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
      await prisma.employee.update({
        where: { id: data.employeeId },
        data: { userId: user.id },
      });
    }

    return user;
  }

  async updateUser(orgId: string, id: string, data: { name?: string; status?: string }) {
    const user = await prisma.user.findFirst({ where: { id, orgId } });
    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : user.name,
        status: data.status !== undefined ? (data.status as any) : user.status,
      },
    });

    return updated;
  }

  async resetPassword(orgId: string, id: string, newPasswordStr: string) {
    const user = await prisma.user.findFirst({ where: { id, orgId } });
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
