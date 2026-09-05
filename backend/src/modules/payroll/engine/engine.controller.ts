import { FastifyReply, FastifyRequest } from 'fastify';
import { EngineService } from './engine.service';
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

    try {
      // Process synchronously instead of using Redis BullMQ (since Redis is unavailable)
      await this.engineService.calculatePayrun(orgId, payrunId);
      
      const { PdfService } = await import('../../reports/pdf.service');
      const pdfService = new PdfService();
      await pdfService.generateBulkPayslips(payrunId);

      await prisma.payrun.update({
        where: { id: payrunId },
        data: { status: 'READY_FOR_APPROVAL' }
      });

      return reply.status(200).send({ 
        success: true, 
        message: 'Payroll calculated successfully'
      });
    } catch (error: any) {
      await prisma.payrun.update({
        where: { id: payrunId },
        data: { status: 'DRAFT' }
      });
      return reply.status(500).send({ error: error.message });
    }
  };
}
