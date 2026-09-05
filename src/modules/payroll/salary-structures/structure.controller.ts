import { FastifyReply, FastifyRequest } from 'fastify';
import { StructureService } from './structure.service';
import { CreateStructureSchema, UpdateStructureSchema } from './structure.schema';

export class StructureController {
  private structureService: StructureService;

  constructor() {
    this.structureService = new StructureService();
  }

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = CreateStructureSchema.parse(request.body);
    const orgId = request.user!.orgId;
    const result = await this.structureService.create(orgId, input);
    return reply.status(201).send({ success: true, data: result });
  };

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const results = await this.structureService.getAll(orgId);
    return reply.send({ success: true, data: results });
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.structureService.getById(orgId, id);
    return reply.send({ success: true, data: result });
  };

  update = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const input = UpdateStructureSchema.parse(request.body);
    const result = await this.structureService.update(orgId, id, input);
    return reply.send({ success: true, data: result });
  };
}
