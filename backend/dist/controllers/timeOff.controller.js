"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeOffController = void 0;
const timeOff_service_1 = require("../services/timeOff.service");
const apiResponse_1 = require("../utils/apiResponse");
class TimeOffController {
    // Types
    static async getAllTypes(req, res, next) {
        try {
            const types = await timeOff_service_1.TimeOffService.getAllTypes();
            return (0, apiResponse_1.sendSuccess)(res, types, 'Time off types fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async createType(req, res, next) {
        try {
            const type = await timeOff_service_1.TimeOffService.createType(req.body);
            return (0, apiResponse_1.sendSuccess)(res, type, 'Time off type created successfully', 201);
        }
        catch (err) {
            next(err);
        }
    }
    // Allocations
    static async getAllAllocations(req, res, next) {
        try {
            let employeeId = req.query.employeeId;
            const status = req.query.status;
            if (req.user?.role === 'EMPLOYEE') {
                if (!req.user.employeeId)
                    throw new apiResponse_1.AppError('No employee profile linked.', 400, 'NO_EMPLOYEE_LINK');
                employeeId = req.user.employeeId;
            }
            const allocations = await timeOff_service_1.TimeOffService.getAllAllocations({ employeeId, status });
            return (0, apiResponse_1.sendSuccess)(res, allocations, 'Leave allocations fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getAllocationById(req, res, next) {
        try {
            const id = req.params.id;
            const allocation = await timeOff_service_1.TimeOffService.getAllocationById(id);
            return (0, apiResponse_1.sendSuccess)(res, allocation, 'Leave allocation fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async createAllocation(req, res, next) {
        try {
            const allocation = await timeOff_service_1.TimeOffService.createAllocation(req.body);
            return (0, apiResponse_1.sendSuccess)(res, allocation, 'Leave allocation granted successfully', 201);
        }
        catch (err) {
            next(err);
        }
    }
    // Requests
    static async getAllRequests(req, res, next) {
        try {
            let employeeId = req.query.employeeId;
            const status = req.query.status;
            if (req.user?.role === 'EMPLOYEE') {
                if (!req.user.employeeId)
                    throw new apiResponse_1.AppError('No employee profile linked.', 400, 'NO_EMPLOYEE_LINK');
                employeeId = req.user.employeeId;
            }
            const requests = await timeOff_service_1.TimeOffService.getAllRequests({ employeeId, status });
            return (0, apiResponse_1.sendSuccess)(res, requests, 'Time off requests fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getRequestById(req, res, next) {
        try {
            const id = req.params.id;
            const request = await timeOff_service_1.TimeOffService.getRequestById(id);
            return (0, apiResponse_1.sendSuccess)(res, request, 'Time off request fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async createRequest(req, res, next) {
        try {
            const employeeId = req.body.employeeId || req.user?.employeeId;
            if (!employeeId)
                throw new apiResponse_1.AppError('Employee ID is required.', 400, 'EMPLOYEE_REQUIRED');
            const request = await timeOff_service_1.TimeOffService.createRequest({
                ...req.body,
                employeeId,
            });
            return (0, apiResponse_1.sendSuccess)(res, request, 'Leave request submitted successfully', 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async approveRequest(req, res, next) {
        try {
            const id = req.params.id;
            const approverName = req.user?.name || 'Manager';
            const approved = await timeOff_service_1.TimeOffService.approveRequest(id, approverName, req.user?.employeeId, req.user?.id);
            return (0, apiResponse_1.sendSuccess)(res, approved, 'Leave request approved and balance updated successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async refuseRequest(req, res, next) {
        try {
            const id = req.params.id;
            const approverName = req.user?.name || 'Manager';
            const refused = await timeOff_service_1.TimeOffService.refuseRequest(id, approverName);
            return (0, apiResponse_1.sendSuccess)(res, refused, 'Leave request refused');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.TimeOffController = TimeOffController;
//# sourceMappingURL=timeOff.controller.js.map