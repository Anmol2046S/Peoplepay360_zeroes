import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../shared/errors';

export const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
    const decoded = jwt.verify(token, secret) as any;
    
    // Inject user context into request
    request.user = {
      id: decoded.id,
      orgId: decoded.orgId,
      email: decoded.email,
      roleId: decoded.roleId,
      permissions: decoded.permissions || [],
    };
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const requirePermission = (requiredPermission: string) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);
    // At this point request.user is guaranteed to be set (requireAuth throws otherwise)
    if (!request.user!.permissions.includes(requiredPermission)) {
      throw new ForbiddenError(`Missing required permission: ${requiredPermission}`);
    }
  };
};
