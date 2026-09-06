import { FastifyReply, FastifyRequest } from 'fastify';
import { TimeOffService } from './timeoff.service';
import { RequestTimeOffSchema } from './timeoff.schema';

export class TimeOffController {
  private timeOffService: TimeOffService;

  constructor() {
    this.timeOffService = new TimeOffService();
  }

  getRequests = async (request: FastifyRequest<{ Querystring: { status?: string; employeeId?: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const requests = await this.timeOffService.getRequests(orgId, request.query);
    return reply.send({ success: true, data: requests });
  };

  getTypes = async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const types = await this.timeOffService.getTypes(orgId);
    return reply.send({ success: true, data: types });
  };

  getAllocations = async (request: FastifyRequest<{ Querystring: { employeeId?: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const allocations = await this.timeOffService.getAllocations(orgId, request.query?.employeeId);
    return reply.send({ success: true, data: allocations });
  };

  createAllocation = async (request: FastifyRequest, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const result = await this.timeOffService.createAllocation(orgId, request.body);
    return reply.status(201).send({ success: true, data: result });
  };

  updateAllocation = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.timeOffService.updateAllocation(orgId, id, request.body);
    return reply.send({ success: true, data: result });
  };

  deleteAllocation = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { id } = request.params;
    const result = await this.timeOffService.deleteAllocation(orgId, id);
    return reply.send({ success: true, data: result });
  };

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
