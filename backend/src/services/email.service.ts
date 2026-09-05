import { transporter } from '../config/mailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { PdfService } from './pdf.service';
import { prisma } from '../config/database';

export class EmailService {
  /**
   * Bulk sends payslip PDFs to all employees in a payrun.
   */
  static async sendPayrunPayslips(payrunId: string) {
    const payrun = await prisma.payrun.findUnique({
      where: { id: payrunId },
      include: {
        payslips: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!payrun) {
      throw new Error('Payrun not found.');
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const slip of payrun.payslips) {
      try {
        const pdfBuffer = await PdfService.generatePayslipPdf(slip.id);

        const mailOptions = {
          from: env.SMTP_FROM,
          to: slip.employee.workEmail,
          subject: `Payslip for ${payrun.name} - ${slip.employee.firstName} ${slip.employee.lastName}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Salary Payslip - ${payrun.name}</h2>
              <p>Dear ${slip.employee.firstName},</p>
              <p>Please find attached your official salary payslip for <strong>${payrun.name}</strong>.</p>
              <ul>
                <li><strong>Gross Salary:</strong> ₹${slip.grossWage.toLocaleString('en-IN')}</li>
                <li><strong>Net Salary:</strong> ₹${slip.netWage.toLocaleString('en-IN')}</li>
              </ul>
              <p>Best regards,<br>Payroll Operations Team<br>PeoplePay360</p>
            </div>
          `,
          attachments: [
            {
              filename: `${slip.payslipNumber.replace(/\//g, '_')}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        };

        if (env.SMTP_HOST && env.SMTP_USER) {
          await transporter.sendMail(mailOptions);
        } else {
          logger.info(`[SMTP Simulation] Would send payslip email to ${slip.employee.workEmail}`);
        }

        await prisma.payslip.update({
          where: { id: slip.id },
          data: { sentEmail: true },
        });

        sentCount++;
      } catch (err: any) {
        logger.error(`Failed to send email to ${slip.employee.workEmail}:`, err);
        failedCount++;
        errors.push(`${slip.employee.workEmail}: ${err.message}`);
      }
    }

    return {
      sentCount,
      failedCount,
      errors,
    };
  }
}
