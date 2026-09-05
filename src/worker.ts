import 'dotenv/config';
import { Worker } from 'bullmq';
import { connection } from './shared/queue';
import { EngineService } from './modules/payroll/engine/engine.service';
import { PdfService } from './modules/reports/pdf.service';
import { prisma } from './database/db';

const engineService = new EngineService();
const pdfService = new PdfService();

console.log('Worker is starting up and listening for jobs on "payrun-calculation" queue...');

const worker = new Worker(
  'payrun-calculation',
  async (job) => {
    const { orgId, payrunId } = job.data;
    console.log(`[Worker] Starting job ${job.id} for payrunId: ${payrunId}`);
    
    try {
      // 1. Calculate Payroll
      console.log(`[Worker] Calculating payroll math...`);
      await engineService.calculatePayrun(orgId, payrunId);
      
      // 2. Generate PDFs
      console.log(`[Worker] Generating PDFs for payslips...`);
      await pdfService.generateBulkPayslips(payrunId);

      // 3. Mark as READY_FOR_APPROVAL
      await prisma.payrun.update({
        where: { id: payrunId },
        data: { status: 'READY_FOR_APPROVAL' }
      });

      console.log(`[Worker] Job ${job.id} completed successfully. Payrun ${payrunId} is ready for approval.`);
    } catch (error: any) {
      console.error(`[Worker] Job ${job.id} failed:`, error.message);
      
      // Revert status on failure so it can be re-tried
      await prisma.payrun.update({
        where: { id: payrunId },
        data: { status: 'DRAFT' } // Revert to draft so user can try again
      });

      throw error;
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`[Worker EVENT] Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`[Worker EVENT] Job ${job?.id} has failed with ${err.message}`);
});
