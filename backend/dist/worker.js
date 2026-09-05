"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bullmq_1 = require("bullmq");
const queue_1 = require("./shared/queue");
const engine_service_1 = require("./modules/payroll/engine/engine.service");
const pdf_service_1 = require("./modules/reports/pdf.service");
const db_1 = require("./database/db");
const engineService = new engine_service_1.EngineService();
const pdfService = new pdf_service_1.PdfService();
console.log('Worker is starting up and listening for jobs on "payrun-calculation" queue...');
const worker = new bullmq_1.Worker('payrun-calculation', async (job) => {
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
        await db_1.prisma.payrun.update({
            where: { id: payrunId },
            data: { status: 'READY_FOR_APPROVAL' }
        });
        console.log(`[Worker] Job ${job.id} completed successfully. Payrun ${payrunId} is ready for approval.`);
    }
    catch (error) {
        console.error(`[Worker] Job ${job.id} failed:`, error.message);
        // Revert status on failure so it can be re-tried
        await db_1.prisma.payrun.update({
            where: { id: payrunId },
            data: { status: 'DRAFT' } // Revert to draft so user can try again
        });
        throw error;
    }
}, { connection: queue_1.connection });
worker.on('completed', (job) => {
    console.log(`[Worker EVENT] Job ${job.id} has completed!`);
});
worker.on('failed', (job, err) => {
    console.log(`[Worker EVENT] Job ${job?.id} has failed with ${err.message}`);
});
