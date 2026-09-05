import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../database/db';
import { LoginInput } from './auth.schema';
import { UnauthorizedError } from '../../shared/errors';

export class AuthService {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { role: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Invalid credentials or inactive account');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const secret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
    const token = jwt.sign(
      {
        id: user.id,
        orgId: user.orgId,
        email: user.email,
        roleId: user.roleId,
        permissions: user.role.permissions,
      },
      secret,
      { expiresIn: '8h' }
    );

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
