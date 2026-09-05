"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = reportRoutes;
const report_controller_1 = require("./report.controller");
const auth_1 = require("../../middleware/auth");
async function reportRoutes(app) {
    const reportController = new report_controller_1.ReportController();
    app.get('/payruns/:payrunId/summary', { preHandler: [(0, auth_1.requirePermission)('REPORT_VIEW')] }, reportController.getPayrunSummary);
    app.get('/payruns/:payrunId/payslips/:employeeId', { preHandler: [(0, auth_1.requirePermission)('REPORT_VIEW')] }, reportController.getEmployeePayslip);
}
