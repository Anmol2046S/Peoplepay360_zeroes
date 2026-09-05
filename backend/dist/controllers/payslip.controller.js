"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayslipController = void 0;
const database_1 = require("../config/database");
const pdf_service_1 = require("../services/pdf.service");
const apiResponse_1 = require("../utils/apiResponse");
class PayslipController {
    static async getAllPayslips(req, res, next) {
        try {
            let employeeId = req.query.employeeId;
            const payrunId = req.query.payrunId;
            if (req.user?.role === 'EMPLOYEE') {
                if (!req.user.employeeId)
                    throw new apiResponse_1.AppError('No employee profile linked.', 400, 'NO_EMPLOYEE_LINK');
                employeeId = req.user.employeeId;
            }
            const where = {};
            if (employeeId)
                where.employeeId = employeeId;
            if (payrunId)
                where.payrunId = payrunId;
            const payslips = await database_1.prisma.payslip.findMany({
                where,
                include: {
                    employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, jobPosition: true } },
                    payrun: { select: { id: true, name: true } },
                    lines: { orderBy: { sequence: 'asc' } },
                },
                orderBy: { startDate: 'desc' },
            });
            return (0, apiResponse_1.sendSuccess)(res, payslips, 'Payslips fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getPayslipById(req, res, next) {
        try {
            const id = req.params.id;
            const slip = await database_1.prisma.payslip.findUnique({
                where: { id },
                include: {
                    employee: { include: { department: true } },
                    contract: true,
                    payrun: { include: { salaryStructure: true } },
                    lines: { orderBy: { sequence: 'asc' } },
                },
            });
            if (!slip) {
                throw new apiResponse_1.AppError(`Payslip with ID ${id} not found.`, 404, 'PAYSLIP_NOT_FOUND');
            }
            // Self-ownership check for employee role
            if (req.user?.role === 'EMPLOYEE' && req.user.employeeId !== slip.employeeId) {
                throw new apiResponse_1.AppError('Forbidden: You can only view your own payslips.', 403, 'FORBIDDEN');
            }
            return (0, apiResponse_1.sendSuccess)(res, slip, 'Payslip details fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getPayslipPdf(req, res, next) {
        try {
            const id = req.params.id;
            const slip = await database_1.prisma.payslip.findUnique({ where: { id } });
            if (!slip) {
                throw new apiResponse_1.AppError(`Payslip with ID ${id} not found.`, 404, 'PAYSLIP_NOT_FOUND');
            }
            if (req.user?.role === 'EMPLOYEE' && req.user.employeeId !== slip.employeeId) {
                throw new apiResponse_1.AppError('Forbidden: You can only view your own payslips.', 403, 'FORBIDDEN');
            }
            const pdfBuffer = await pdf_service_1.PdfService.generatePayslipPdf(id);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${slip.payslipNumber.replace(/\//g, '_')}.pdf"`);
            return res.status(200).send(pdfBuffer);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.PayslipController = PayslipController;
//# sourceMappingURL=payslip.controller.js.map