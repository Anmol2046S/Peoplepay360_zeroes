"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
class PdfService {
    /**
     * Generates a printable PDF payslip document for an employee.
     * Returns Buffer containing binary PDF data.
     */
    static async generatePayslipPdf(payslipId) {
        const slip = await database_1.prisma.payslip.findUnique({
            where: { id: payslipId },
            include: {
                employee: {
                    include: {
                        department: true,
                    },
                },
                contract: true,
                payrun: {
                    include: {
                        salaryStructure: true,
                    },
                },
                lines: {
                    orderBy: { sequence: 'asc' },
                },
            },
        });
        if (!slip) {
            throw new apiResponse_1.AppError(`Payslip with ID ${payslipId} not found.`, 404, 'PAYSLIP_NOT_FOUND');
        }
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50 });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);
            // Header Banner
            doc.fillColor('#1E293B').fontSize(22).text('PeoplePay360 HR & Payroll', { align: 'left' });
            doc.fontSize(10).fillColor('#64748B').text('Official Employee Salary Payslip', { align: 'left' });
            doc.moveDown(1);
            // Divider
            doc.moveTo(50, 95).lineTo(545, 95).strokeColor('#E2E8F0').lineWidth(1).stroke();
            doc.moveDown(1.5);
            // Payslip Metadata Grid
            const metaY = 110;
            doc.fontSize(10).fillColor('#334155');
            doc.text(`Payslip Number: ${slip.payslipNumber}`, 50, metaY);
            doc.text(`Pay Period: ${slip.startDate.toISOString().split('T')[0]} to ${slip.endDate.toISOString().split('T')[0]}`, 300, metaY);
            doc.text(`Employee Name: ${slip.employee.firstName} ${slip.employee.lastName}`, 50, metaY + 18);
            doc.text(`Employee Code: ${slip.employee.employeeCode}`, 300, metaY + 18);
            doc.text(`Department: ${slip.employee.department.name}`, 50, metaY + 36);
            doc.text(`Job Position: ${slip.employee.jobPosition}`, 300, metaY + 36);
            doc.text(`Contract Ref: ${slip.contract.contractReference}`, 50, metaY + 54);
            doc.text(`Worked Days: ${slip.workedDays} Days`, 300, metaY + 54);
            doc.moveDown(2);
            const tableHeaderY = metaY + 90;
            // Table Header
            doc.rect(50, tableHeaderY, 495, 24).fill('#F1F5F9');
            doc.fillColor('#0F172A').fontSize(10).text('Rule Code', 60, tableHeaderY + 7);
            doc.text('Salary Component Name', 140, tableHeaderY + 7);
            doc.text('Category', 340, tableHeaderY + 7);
            doc.text('Amount (₹)', 460, tableHeaderY + 7, { width: 75, align: 'right' });
            let currentY = tableHeaderY + 30;
            // Render Salary Lines
            for (const line of slip.lines) {
                doc.fillColor('#334155').fontSize(9);
                doc.text(line.code, 60, currentY);
                doc.text(line.name, 140, currentY);
                doc.text(line.category, 340, currentY);
                const isDeduction = line.category === 'DEDUCTION';
                const formattedAmount = isDeduction ? `-${line.amount.toLocaleString('en-IN')}` : line.amount.toLocaleString('en-IN');
                doc.fillColor(isDeduction ? '#DC2626' : '#0F172A');
                doc.text(formattedAmount, 460, currentY, { width: 75, align: 'right' });
                currentY += 20;
            }
            // Divider before totals
            currentY += 10;
            doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor('#CBD5E1').stroke();
            currentY += 15;
            // Totals Summary Box
            doc.fontSize(11).fillColor('#0F172A');
            doc.text(`Basic Wage: ₹${slip.basicWage.toLocaleString('en-IN')}`, 50, currentY);
            doc.text(`Gross Salary: ₹${slip.grossWage.toLocaleString('en-IN')}`, 250, currentY);
            doc.fontSize(12).fillColor('#16A34A').text(`Net Wage: ₹${slip.netWage.toLocaleString('en-IN')}`, 400, currentY);
            // Footer Note
            doc.fontSize(8).fillColor('#94A3B8').text('This is a system-generated payslip from PeoplePay360. No signature required.', 50, 720, { align: 'center' });
            doc.end();
        });
    }
}
exports.PdfService = PdfService;
//# sourceMappingURL=pdf.service.js.map