import { FastifyReply, FastifyRequest } from 'fastify';
import { RuleService } from './rule.service';
import { CreateRuleSchema } from './rule.schema';

export class RuleController {
  private ruleService: RuleService;

  constructor() {
    this.ruleService = new RuleService();
  }

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = CreateRuleSchema.parse(request.body);
    const orgId = request.user!.orgId;
    const result = await this.ruleService.create(orgId, input);
    return reply.status(201).send({ success: true, data: result });
  };

  getByStructureId = async (request: FastifyRequest<{ Params: { structureId: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { structureId } = request.params;
    const results = await this.ruleService.getByStructureId(orgId, structureId);
    return reply.send({ success: true, data: results });
  };
}
