"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const employee_service_1 = require("../services/employee.service");
const apiResponse_1 = require("../utils/apiResponse");
class EmployeeController {
    static async getAllEmployees(req, res, next) {
        try {
            const search = req.query.search;
            const departmentId = req.query.departmentId;
            const status = req.query.status;
            const view = req.query.view;
            const employees = await employee_service_1.EmployeeService.getAllEmployees({ search, departmentId, status, view });
            return (0, apiResponse_1.sendSuccess)(res, employees, 'Employees fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getEmployeeById(req, res, next) {
        try {
            const id = req.params.id;
            const employee = await employee_service_1.EmployeeService.getEmployeeById(id);
            return (0, apiResponse_1.sendSuccess)(res, employee, 'Employee fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async createEmployee(req, res, next) {
        try {
            const newEmp = await employee_service_1.EmployeeService.createEmployee(req.body);
            return (0, apiResponse_1.sendSuccess)(res, newEmp, 'Employee master record created successfully', 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async updateEmployee(req, res, next) {
        try {
            const id = req.params.id;
            const updated = await employee_service_1.EmployeeService.updateEmployee(id, req.body);
            return (0, apiResponse_1.sendSuccess)(res, updated, 'Employee updated successfully');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.EmployeeController = EmployeeController;
//# sourceMappingURL=employee.controller.js.map