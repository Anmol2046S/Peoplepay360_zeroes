"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const mailer_1 = require("../config/mailer");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const pdf_service_1 = require("./pdf.service");
const database_1 = require("../config/database");
class EmailService {
    /**
     * Bulk sends payslip PDFs to all employees in a payrun.
     */
    static async sendPayrunPayslips(payrunId) {
        const payrun = await database_1.prisma.payrun.findUnique({
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
        const errors = [];
        for (const slip of payrun.payslips) {
            try {
                const pdfBuffer = await pdf_service_1.PdfService.generatePayslipPdf(slip.id);
                const mailOptions = {
                    from: env_1.env.SMTP_FROM,
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
                if (env_1.env.SMTP_HOST && env_1.env.SMTP_USER) {
                    await mailer_1.transporter.sendMail(mailOptions);
                }
                else {
                    logger_1.logger.info(`[SMTP Simulation] Would send payslip email to ${slip.employee.workEmail}`);
                }
                await database_1.prisma.payslip.update({
                    where: { id: slip.id },
                    data: { sentEmail: true },
                });
                sentCount++;
            }
            catch (err) {
                logger_1.logger.error(`Failed to send email to ${slip.employee.workEmail}:`, err);
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
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map