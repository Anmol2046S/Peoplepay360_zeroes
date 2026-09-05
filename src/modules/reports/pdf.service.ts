import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../../database/db';

export class PdfService {
  async generateBulkPayslips(payrunId: string): Promise<void> {
    const payrun = await prisma.payrun.findUnique({
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

    if (!payrun) throw new Error('Payrun not found');

    const outputDir = path.join(process.cwd(), 'reports', 'payslips', payrunId);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const payslip of payrun.payslips) {
      const doc = new PDFDocument({ margin: 50 });
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
