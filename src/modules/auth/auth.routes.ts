import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import { requireAuth } from '../../middleware/auth';

export default async function authRoutes(app: FastifyInstance) {
  const authController = new AuthController();

  app.post('/login', authController.login);
  app.get('/me', { preHandler: [requireAuth] }, authController.me);
}
