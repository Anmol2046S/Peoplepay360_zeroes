import { FastifyReply, FastifyRequest } from 'fastify';
import { TimeOffService } from './timeoff.service';
import { RequestTimeOffSchema } from './timeoff.schema';

export class TimeOffController {
  private timeOffService: TimeOffService;

  constructor() {
    this.timeOffService = new TimeOffService();
  }

  requestTimeOff = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = RequestTimeOffSchema.parse(request.body);
    const orgId = request.user!.orgId;
    const result = await this.timeOffService.requestTimeOff(orgId, input);
    return reply.status(201).send({ success: true, data: result });
  };

  approve = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.timeOffService.approve(orgId, id);
    return reply.send({ success: true, data: result });
  };

  reject = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.timeOffService.reject(orgId, id);
    return reply.send({ success: true, data: result });
  };
}
