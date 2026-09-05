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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const db_1 = require("../../database/db");
class PdfService {
    async generateBulkPayslips(payrunId) {
        const payrun = await db_1.prisma.payrun.findUnique({
            where: { id: payrunId },
            include: {
                organization: true,
                payslips: {
                    include: {
                        employee: true,
                        lines: {
                            orderBy: { sequence: 'asc' }
                        }
                    }
                }
            }
        });
        if (!payrun)
            throw new Error('Payrun not found');
        const outputDir = path.join(process.cwd(), 'reports', 'payslips', payrunId);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        for (const payslip of payrun.payslips) {
            const doc = new pdfkit_1.default({ margin: 50 });
            const filePath = path.join(outputDir, `${payslip.employeeId}.pdf`);
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);
            // Header
            doc.fontSize(20).text(`${payrun.organization.name} - Payslip`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Employee: ${payslip.employee.firstName} ${payslip.employee.lastName}`);
            doc.text(`Period: ${payrun.periodStart.toISOString().split('T')[0]} to ${payrun.periodEnd.toISOString().split('T')[0]}`);
            doc.moveDown();
            // Lines
            doc.fontSize(14).text('Earnings & Deductions', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12);
            for (const line of payslip.lines) {
                const sign = line.category === 'DEDUCTION' ? '-' : '+';
                doc.text(`${line.ruleCode.padEnd(20)}: ${sign} $${line.amount.toString()}`);
            }
            doc.moveDown();
            doc.fontSize(14).text(`Gross Pay: $${payslip.grossAmount.toString()}`);
            doc.fontSize(16).text(`Net Pay: $${payslip.netAmount.toString()}`, { underline: true });
            doc.end();
        }
    }
}
exports.PdfService = PdfService;
