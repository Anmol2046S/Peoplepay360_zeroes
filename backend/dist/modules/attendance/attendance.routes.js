"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = attendanceRoutes;
const attendance_controller_1 = require("./attendance.controller");
const auth_1 = require("../../middleware/auth");
async function attendanceRoutes(app) {
    const attendanceController = new attendance_controller_1.AttendanceController();
    app.post('/', { preHandler: [(0, auth_1.requirePermission)(['ATTENDANCE_CREATE', 'ATTENDANCE_SELF'])] }, attendanceController.checkIn);
    app.post('/check-in', { preHandler: [(0, auth_1.requirePermission)(['ATTENDANCE_CREATE', 'ATTENDANCE_SELF'])] }, attendanceController.checkIn);
    app.patch('/:id/checkout', { preHandler: [(0, auth_1.requirePermission)(['ATTENDANCE_UPDATE', 'ATTENDANCE_SELF'])] }, attendanceController.checkOut);
    app.patch('/:id/check-out', { preHandler: [(0, auth_1.requirePermission)(['ATTENDANCE_UPDATE', 'ATTENDANCE_SELF'])] }, attendanceController.checkOut);
    app.post('/:id/check-out', { preHandler: [(0, auth_1.requirePermission)(['ATTENDANCE_UPDATE', 'ATTENDANCE_SELF'])] }, attendanceController.checkOut);
    app.post('/:id/checkout', { preHandler: [(0, auth_1.requirePermission)(['ATTENDANCE_UPDATE', 'ATTENDANCE_SELF'])] }, attendanceController.checkOut);
    app.get('/', { preHandler: [(0, auth_1.requirePermission)(['ATTENDANCE_READ', 'ATTENDANCE_SELF'])] }, attendanceController.getAll);
    app.get('/employee/:employeeId', { preHandler: [(0, auth_1.requirePermission)(['ATTENDANCE_READ', 'ATTENDANCE_SELF'])] }, attendanceController.getByEmployee);
}
