"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = employeeRoutes;
const employee_controller_1 = require("./employee.controller");
const auth_1 = require("../../middleware/auth");
async function employeeRoutes(app) {
    const employeeController = new employee_controller_1.EmployeeController();
    app.post('/', { preHandler: [(0, auth_1.requirePermission)('EMPLOYEE_CREATE')] }, employeeController.create);
    app.get('/', { preHandler: [(0, auth_1.requirePermission)(['EMPLOYEE_READ', 'ATTENDANCE_SELF', 'TIMEOFF_REQUEST_SELF', 'PAYSLIP_READ_SELF'])] }, employeeController.getAll);
    app.get('/:id', { preHandler: [(0, auth_1.requirePermission)(['EMPLOYEE_READ', 'ATTENDANCE_SELF', 'TIMEOFF_REQUEST_SELF', 'PAYSLIP_READ_SELF'])] }, employeeController.getById);
    app.patch('/:id', { preHandler: [(0, auth_1.requirePermission)('EMPLOYEE_UPDATE')] }, employeeController.update);
}
