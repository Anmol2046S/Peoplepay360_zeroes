import { FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      orgId: string;
      email: string;
      roleId: string;
      permissions: string[];
    };
  }
}
