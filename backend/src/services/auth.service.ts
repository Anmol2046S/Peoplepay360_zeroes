import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { jwtConfig } from '../config/jwt';
import { AppError } from '../utils/apiResponse';

export class AuthService {
  static async login(email: string, passwordStr: string) {
    const user = await prisma.user.findUnique({
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
      throw new AppError('Invalid work email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('Account is inactive or suspended. Please contact administrator.', 403, 'ACCOUNT_INACTIVE');
    }

    const isMatch = await bcrypt.compare(passwordStr, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid work email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn as any,
    });

    // Log login action
    await prisma.auditLog.create({
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

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
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
      throw new AppError('User session invalid or account inactive.', 401, 'UNAUTHORIZED');
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
