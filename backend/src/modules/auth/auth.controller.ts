import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { LoginSchema } from './auth.schema';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = LoginSchema.parse(request.body);
    const result = await this.authService.login(input);
    
    return reply.send({
      success: true,
      data: result,
    });
  };

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      data: request.user,
    });
  };
}
