"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineController = void 0;
const engine_service_1 = require("./engine.service");
const queue_1 = require("../../../shared/queue");
const db_1 = require("../../../database/db");
class EngineController {
    engineService;
    constructor() {
        this.engineService = new engine_service_1.EngineService();
    }
    calculate = async (request, reply) => {
        const orgId = request.user.orgId;
        const { payrunId } = request.params;
        // Validate payrun belongs to org and is DRAFT
        const payrun = await db_1.prisma.payrun.findFirst({
            where: { id: payrunId, orgId, status: 'DRAFT' }
        });
        if (!payrun) {
            return reply.status(404).send({ error: 'Payrun not found or not in DRAFT status' });
        }
        // Set status to CALCULATING
        await db_1.prisma.payrun.update({
            where: { id: payrunId },
            data: { status: 'CALCULATING' }
        });
        // Enqueue background job
        const job = await queue_1.payrunQueue.add('calculate_payrun', { orgId, payrunId });
        return reply.status(202).send({
            success: true,
            message: 'Payroll calculation queued successfully',
            jobId: job.id
        });
    };
}
exports.EngineController = EngineController;
