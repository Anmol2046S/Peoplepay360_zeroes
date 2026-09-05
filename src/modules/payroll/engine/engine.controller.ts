import { FastifyReply, FastifyRequest } from 'fastify';
import { EngineService } from './engine.service';
import { payrunQueue } from '../../../shared/queue';
import { prisma } from '../../../database/db';

export class EngineController {
  private engineService: EngineService;

  constructor() {
    this.engineService = new EngineService();
  }

  calculate = async (request: FastifyRequest<{ Params: { payrunId: string } }>, reply: FastifyReply) => {
    const orgId = request.user!.orgId;
    const { payrunId } = request.params;
    
    // Validate payrun belongs to org and is DRAFT
    const payrun = await prisma.payrun.findFirst({
      where: { id: payrunId, orgId, status: 'DRAFT' }
    });

    if (!payrun) {
      return reply.status(404).send({ error: 'Payrun not found or not in DRAFT status' });
    }

    // Set status to CALCULATING
    await prisma.payrun.update({
      where: { id: payrunId },
      data: { status: 'CALCULATING' }
    });

    // Enqueue background job
    const job = await payrunQueue.add('calculate_payrun', { orgId, payrunId });

    return reply.status(202).send({ 
      success: true, 
      message: 'Payroll calculation queued successfully',
      jobId: job.id
    });
  };
}
