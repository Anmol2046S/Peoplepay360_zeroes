import { FastifyReply, FastifyRequest } from 'fastify';
import { PayrunService } from './payrun.service';
import { CreatePayrunSchema } from './payrun.schema';

export class PayrunController {
  private payrunService: PayrunService;

  constructor() {
    this.payrunService = new PayrunService();
  }

  initialize = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = CreatePayrunSchema.parse(request.body);
    const orgId = request.user!.orgId;
    const userId = request.user!.id;
    
    const result = await this.payrunService.initialize(orgId, input, userId);
    return reply.status(201).send({ success: true, data: result });
  };

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const results = await this.payrunService.getAll(orgId);
    return reply.send({ success: true, data: results });
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.payrunService.getById(orgId, id);
    return reply.send({ success: true, data: result });
  };

  submitForApproval = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.payrunService.submitForApproval(orgId, id);
    return reply.send({ success: true, data: result });
  };

  approve = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const userId = request.user!.id;
    const result = await this.payrunService.approve(orgId, id, userId);
    return reply.send({ success: true, data: result });
  };

  reject = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.payrunService.reject(orgId, id);
    return reply.send({ success: true, data: result });
  };

  finalize = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.payrunService.finalize(orgId, id);
    return reply.send({ success: true, data: result });
  };
}
