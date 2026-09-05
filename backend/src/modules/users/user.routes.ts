import { FastifyInstance } from 'fastify';
import { UserController } from './user.controller';
import { requirePermission } from '../../middleware/auth';

export default async function userRoutes(app: FastifyInstance) {
  const userController = new UserController();

  app.get('/', { preHandler: [requirePermission('USER_MANAGE')] }, userController.getAllUsers);
  app.post('/', { preHandler: [requirePermission('USER_MANAGE')] }, userController.createUser);
  app.patch<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission('USER_MANAGE')] }, userController.updateUser);
  app.post<{ Params: { id: string } }>('/:id/reset-password', { preHandler: [requirePermission('USER_MANAGE')] }, userController.resetPassword);
}
