import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';
import { PdfService } from '../services/pdf.service';
import { sendSuccess, AppError } from '../utils/apiResponse';

export class PayslipController {
  static async getAllPayslips(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let employeeId = req.query.employeeId as string;
      const payrunId = req.query.payrunId as string;

      if (req.user?.role === 'EMPLOYEE') {
        if (!req.user.employeeId) throw new AppError('No employee profile linked.', 400, 'NO_EMPLOYEE_LINK');
        employeeId = req.user.employeeId;
      }

      const where: any = {};
      if (employeeId) where.employeeId = employeeId;
      if (payrunId) where.payrunId = payrunId;

      const payslips = await prisma.payslip.findMany({
        where,
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, jobPosition: true } },
          payrun: { select: { id: true, name: true } },
          lines: { orderBy: { sequence: 'asc' } },
        },
        orderBy: { startDate: 'desc' },
      });

      return sendSuccess(res, payslips, 'Payslips fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getPayslipById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const slip = await prisma.payslip.findUnique({
        where: { id },
        include: {
          employee: { include: { department: true } },
          contract: true,
          payrun: { include: { salaryStructure: true } },
          lines: { orderBy: { sequence: 'asc' } },
        },
      });

      if (!slip) {
        throw new AppError(`Payslip with ID ${id} not found.`, 404, 'PAYSLIP_NOT_FOUND');
      }

      // Self-ownership check for employee role
      if (req.user?.role === 'EMPLOYEE' && req.user.employeeId !== slip.employeeId) {
        throw new AppError('Forbidden: You can only view your own payslips.', 403, 'FORBIDDEN');
      }

      return sendSuccess(res, slip, 'Payslip details fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getPayslipPdf(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const slip = await prisma.payslip.findUnique({ where: { id } });

      if (!slip) {
        throw new AppError(`Payslip with ID ${id} not found.`, 404, 'PAYSLIP_NOT_FOUND');
      }

      if (req.user?.role === 'EMPLOYEE' && req.user.employeeId !== slip.employeeId) {
        throw new AppError('Forbidden: You can only view your own payslips.', 403, 'FORBIDDEN');
      }

      const pdfBuffer = await PdfService.generatePayslipPdf(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${slip.payslipNumber.replace(/\//g, '_')}.pdf"`);
      return res.status(200).send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
}
