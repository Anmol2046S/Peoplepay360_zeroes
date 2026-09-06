import { FastifyReply, FastifyRequest } from 'fastify';
import { ContractService } from './contract.service';
import { CreateContractSchema } from './contract.schema';

export class ContractController {
  private contractService: ContractService;

  constructor() {
    this.contractService = new ContractService();
  }

  getAll = async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const contracts = await this.contractService.getAll(orgId);
    return reply.send({ success: true, data: contracts });
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const contract = await this.contractService.getById(orgId, id);
    return reply.send({ success: true, data: contract });
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = CreateContractSchema.parse(request.body);
    const orgId = request.user!.orgId;
    const result = await this.contractService.create(orgId, input);
    return reply.status(201).send({ success: true, data: result });
  };

  getByEmployee = async (request: FastifyRequest<{ Params: { employeeId: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { employeeId } = request.params;
    const contracts = await this.contractService.getByEmployee(orgId, employeeId);
    return reply.send({ success: true, data: contracts });
  };

  update = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const updated = await this.contractService.update(orgId, id, request.body);
    return reply.send({ success: true, data: updated });
  };

  delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.contractService.delete(orgId, id);
    return reply.send({ success: true, data: result });
  };
}
