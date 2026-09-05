import { FastifyReply, FastifyRequest } from 'fastify';
import { EngineService } from './engine.service';

export class EngineController {
  private engineService: EngineService;

  constructor() {
    this.engineService = new EngineService();
  }

  calculate = async (request: FastifyRequest<{ Params: { payrunId: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { payrunId } = request.params;
    
    const result = await this.engineService.calculatePayrun(orgId, payrunId);
    return reply.status(200).send({ success: true, data: result });
  };
}
