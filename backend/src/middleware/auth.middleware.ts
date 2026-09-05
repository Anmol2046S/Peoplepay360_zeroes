import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { prisma } from '../config/database';
import { AppError } from '../utils/apiResponse';
import { SystemRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: SystemRole;
    employeeId?: string | null;
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing token.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtConfig.secret) as { id: string; email: string; role: SystemRole };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        employeeId: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('User account is inactive or no longer exists.', 401, 'UNAUTHORIZED');
    }

    let resolvedEmployeeId = user.employeeId;

    if (!resolvedEmployeeId) {
      // Automatic fallback resolution: find matching employee profile by workEmail or user relation
      const matchedEmp = await prisma.employee.findFirst({
        where: {
          OR: [
            { workEmail: user.email },
            { user: { id: user.id } },
          ],
        },
      });

      if (matchedEmp) {
        await prisma.user.update({
          where: { id: user.id },
          data: { employeeId: matchedEmp.id },
        });
        resolvedEmployeeId = matchedEmp.id;
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      employeeId: resolvedEmployeeId,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid or expired authentication token.', 401, 'UNAUTHORIZED'));
    }
    next(err);
  }
}
