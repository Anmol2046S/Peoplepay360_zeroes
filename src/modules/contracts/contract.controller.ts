import { FastifyReply, FastifyRequest } from 'fastify';
import { ContractService } from './contract.service';
import { CreateContractSchema } from './contract.schema';

export class ContractController {
  private contractService: ContractService;

  constructor() {
    this.contractService = new ContractService();
  }

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
}
