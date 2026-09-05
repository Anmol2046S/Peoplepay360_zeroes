"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineController = void 0;
const engine_service_1 = require("./engine.service");
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
        try {
            // Process synchronously instead of using Redis BullMQ (since Redis is unavailable)
            await this.engineService.calculatePayrun(orgId, payrunId);
            const { PdfService } = await Promise.resolve().then(() => __importStar(require('../../reports/pdf.service')));
            const pdfService = new PdfService();
            await pdfService.generateBulkPayslips(payrunId);
            await db_1.prisma.payrun.update({
                where: { id: payrunId },
                data: { status: 'READY_FOR_APPROVAL' }
            });
            return reply.status(200).send({
                success: true,
                message: 'Payroll calculated successfully'
            });
        }
        catch (error) {
            await db_1.prisma.payrun.update({
                where: { id: payrunId },
                data: { status: 'DRAFT' }
            });
            return reply.status(500).send({ error: error.message });
        }
    };
}
exports.EngineController = EngineController;
