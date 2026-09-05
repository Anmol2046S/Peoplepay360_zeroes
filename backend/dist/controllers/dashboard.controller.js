"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const apiResponse_1 = require("../utils/apiResponse");
class DashboardController {
    static async getMetrics(req, res, next) {
        try {
            const period = req.query.period;
            const departmentId = req.query.departmentId;
            const company = req.query.company;
            const metrics = await dashboard_service_1.DashboardService.getMetrics({ period, departmentId, company });
            return (0, apiResponse_1.sendSuccess)(res, metrics, 'Dashboard metrics fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getDepartmentCosts(req, res, next) {
        try {
            const costs = await dashboard_service_1.DashboardService.getDepartmentCosts();
            return (0, apiResponse_1.sendSuccess)(res, costs, 'Department costs breakdown fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getSalaryTrend(req, res, next) {
        try {
            const trend = await dashboard_service_1.DashboardService.getMonthlySalaryTrend();
            return (0, apiResponse_1.sendSuccess)(res, trend, 'Monthly net salary trend fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getAlerts(req, res, next) {
        try {
            const alerts = await dashboard_service_1.DashboardService.getOperationalAlerts();
            return (0, apiResponse_1.sendSuccess)(res, alerts, 'Payroll operational alerts fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map