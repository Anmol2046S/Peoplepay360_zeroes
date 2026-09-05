import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PayrunService } from '../services/payrun.service';
import { EmailService } from '../services/email.service';
import { sendSuccess } from '../utils/apiResponse';

export class PayrunController {
  static async getAllPayruns(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payruns = await PayrunService.getAllPayruns();
      return sendSuccess(res, payruns, 'Payruns fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getPayrunById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const payrun = await PayrunService.getPayrunById(id);
      return sendSuccess(res, payrun, 'Payrun details fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getEligibleEmployees(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { salaryStructureId, startDate, endDate } = req.body;
      const employees = await PayrunService.getEligibleEmployees(salaryStructureId, startDate, endDate);
      return sendSuccess(res, employees, 'Eligible employees for scope fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createPayrun(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const newPayrun = await PayrunService.createPayrun(req.body);
      return sendSuccess(res, newPayrun, 'Payrun initialized successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async computePayrun(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const computed = await PayrunService.computePayrun(id);
      return sendSuccess(res, computed, 'Payrun computed successfully');
    } catch (err) {
      next(err);
    }
  }

  static async validatePayrun(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const validated = await PayrunService.validatePayrun(id);
      return sendSuccess(res, validated, 'Payrun validated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async markPaid(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const paid = await PayrunService.markPaid(id);
      return sendSuccess(res, paid, 'Payrun marked as paid');
    } catch (err) {
      next(err);
    }
  }

  static async sendPayslips(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const result = await EmailService.sendPayrunPayslips(id);
      return sendSuccess(res, result, `Dispatched payslip emails to ${result.sentCount} employees.`);
    } catch (err) {
      next(err);
    }
  }
}
