"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = attendanceRoutes;
const attendance_controller_1 = require("./attendance.controller");
const auth_1 = require("../../middleware/auth");
async function attendanceRoutes(app) {
    const attendanceController = new attendance_controller_1.AttendanceController();
    app.post('/', { preHandler: [(0, auth_1.requirePermission)('ATTENDANCE_CREATE')] }, attendanceController.checkIn);
    app.patch('/:id/checkout', { preHandler: [(0, auth_1.requirePermission)('ATTENDANCE_UPDATE')] }, attendanceController.checkOut);
    app.get('/employee/:employeeId', { preHandler: [(0, auth_1.requirePermission)('ATTENDANCE_READ')] }, attendanceController.getByEmployee);
}
