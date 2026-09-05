import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/apiResponse';

export class DashboardController {
  static async getMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const period = req.query.period as string;
      const departmentId = req.query.departmentId as string;
      const company = req.query.company as string;

      const metrics = await DashboardService.getMetrics({ period, departmentId, company });
      return sendSuccess(res, metrics, 'Dashboard metrics fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getDepartmentCosts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const costs = await DashboardService.getDepartmentCosts();
      return sendSuccess(res, costs, 'Department costs breakdown fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getSalaryTrend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trend = await DashboardService.getMonthlySalaryTrend();
      return sendSuccess(res, trend, 'Monthly net salary trend fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const alerts = await DashboardService.getOperationalAlerts();
      return sendSuccess(res, alerts, 'Payroll operational alerts fetched successfully');
    } catch (err) {
      next(err);
    }
  }
}
