"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrunController = void 0;
const payrun_service_1 = require("../services/payrun.service");
const email_service_1 = require("../services/email.service");
const apiResponse_1 = require("../utils/apiResponse");
class PayrunController {
    static async getAllPayruns(req, res, next) {
        try {
            const payruns = await payrun_service_1.PayrunService.getAllPayruns();
            return (0, apiResponse_1.sendSuccess)(res, payruns, 'Payruns fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getPayrunById(req, res, next) {
        try {
            const id = req.params.id;
            const payrun = await payrun_service_1.PayrunService.getPayrunById(id);
            return (0, apiResponse_1.sendSuccess)(res, payrun, 'Payrun details fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getEligibleEmployees(req, res, next) {
        try {
            const { salaryStructureId, startDate, endDate } = req.body;
            const employees = await payrun_service_1.PayrunService.getEligibleEmployees(salaryStructureId, startDate, endDate);
            return (0, apiResponse_1.sendSuccess)(res, employees, 'Eligible employees for scope fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async createPayrun(req, res, next) {
        try {
            const newPayrun = await payrun_service_1.PayrunService.createPayrun(req.body);
            return (0, apiResponse_1.sendSuccess)(res, newPayrun, 'Payrun initialized successfully', 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async computePayrun(req, res, next) {
        try {
            const id = req.params.id;
            const computed = await payrun_service_1.PayrunService.computePayrun(id);
            return (0, apiResponse_1.sendSuccess)(res, computed, 'Payrun computed successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async validatePayrun(req, res, next) {
        try {
            const id = req.params.id;
            const validated = await payrun_service_1.PayrunService.validatePayrun(id);
            return (0, apiResponse_1.sendSuccess)(res, validated, 'Payrun validated successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async markPaid(req, res, next) {
        try {
            const id = req.params.id;
            const paid = await payrun_service_1.PayrunService.markPaid(id);
            return (0, apiResponse_1.sendSuccess)(res, paid, 'Payrun marked as paid');
        }
        catch (err) {
            next(err);
        }
    }
    static async sendPayslips(req, res, next) {
        try {
            const id = req.params.id;
            const result = await email_service_1.EmailService.sendPayrunPayslips(id);
            return (0, apiResponse_1.sendSuccess)(res, result, `Dispatched payslip emails to ${result.sentCount} employees.`);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.PayrunController = PayrunController;
//# sourceMappingURL=payrun.controller.js.map