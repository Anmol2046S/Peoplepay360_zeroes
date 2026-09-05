import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from './user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const query = (request.query || {}) as { search?: string; role?: string };
    const users = await this.userService.getAllUsers(orgId, query.search, query.role);
    return reply.send({ success: true, data: users });
  };

  createUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const body = (request.body || {}) as { name: string; email: string; password?: string; role?: string; employeeId?: string };
    const user = await this.userService.createUser(orgId, body);
    return reply.status(201).send({ success: true, data: user });
  };

  updateUser = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const body = (request.body || {}) as { name?: string; status?: string };
    const user = await this.userService.updateUser(orgId, id, body);
    return reply.send({ success: true, data: user });
  };

  resetPassword = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const body = (request.body || {}) as { newPassword?: string; password?: string };
    const newPassword = body.newPassword || body.password || '';
    const result = await this.userService.resetPassword(orgId, id, newPassword);
    return reply.send({ success: true, data: result, message: 'Password reset successfully' });
  };
}
