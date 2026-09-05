"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const report_service_1 = require("./report.service");
class ReportController {
    reportService;
    constructor() {
        this.reportService = new report_service_1.ReportService();
    }
    getPayrunSummary = async (request, reply) => {
        const orgId = request.user.orgId;
        const { payrunId } = request.params;
        const result = await this.reportService.getPayrunSummary(orgId, payrunId);
        return reply.send({ success: true, data: result });
    };
    getEmployeePayslip = async (request, reply) => {
        const orgId = request.user.orgId;
        const { payrunId, employeeId } = request.params;
        const result = await this.reportService.getEmployeePayslip(orgId, payrunId, employeeId);
        return reply.send({ success: true, data: result });
    };
}
exports.ReportController = ReportController;
