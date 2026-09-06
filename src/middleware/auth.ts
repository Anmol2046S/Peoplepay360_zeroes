import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../shared/errors';

export const isAdministrator = (request: FastifyRequest) => {
  const role = String(request.user?.role || '').toUpperCase();
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
};

export const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
    const decoded = jwt.verify(token, secret) as any;
    let role = decoded.role;
    if (!role && decoded.roleId) {
      const { prisma } = await import('../database/db');
      const roleRecord = await prisma.role.findUnique({ where: { id: decoded.roleId } });
      role = roleRecord?.name;
    }
    
    // Inject user context into request
    request.user = {
      id: decoded.id,
      orgId: decoded.orgId,
      email: decoded.email,
      roleId: decoded.roleId,
      employeeId: decoded.employeeId || null,
      role,
      permissions: decoded.permissions || [],
    };
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const requirePermission = (requiredPermission: string | string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);
    // At this point request.user is guaranteed to be set (requireAuth throws otherwise)
    if (isAdministrator(request)) return;
    const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    if (!required.some((permission) => request.user!.permissions.includes(permission))) {
      throw new ForbiddenError(`Missing required permission: ${required.join(' or ')}`);
    }
  };
};
