"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const attendance_service_1 = require("../services/attendance.service");
const apiResponse_1 = require("../utils/apiResponse");
class AttendanceController {
    static async getAllAttendance(req, res, next) {
        try {
            let employeeId = req.query.employeeId;
            const date = req.query.date;
            const status = req.query.status;
            // Employee role can view only own attendance records
            if (req.user?.role === 'EMPLOYEE') {
                if (!req.user.employeeId) {
                    throw new apiResponse_1.AppError('Employee profile not linked to user account.', 400, 'NO_EMPLOYEE_LINK');
                }
                employeeId = req.user.employeeId;
            }
            const records = await attendance_service_1.AttendanceService.getAllAttendance({ employeeId, date, status });
            return (0, apiResponse_1.sendSuccess)(res, records, 'Attendance records fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getActiveSession(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                return (0, apiResponse_1.sendSuccess)(res, null, 'No linked employee profile for active session');
            }
            const active = await attendance_service_1.AttendanceService.getActiveSession(req.user.employeeId);
            return (0, apiResponse_1.sendSuccess)(res, active, 'Active session status fetched');
        }
        catch (err) {
            next(err);
        }
    }
    static async checkIn(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                throw new apiResponse_1.AppError('This account is a standalone administrative user without a linked employee record. Personal punch clock is active for employee accounts.', 400, 'NO_EMPLOYEE_LINK');
            }
            const timestamp = req.body.timestamp;
            const record = await attendance_service_1.AttendanceService.checkIn(req.user.employeeId, timestamp);
            return (0, apiResponse_1.sendSuccess)(res, record, 'Checked in successfully', 201);
        }
        catch (err) {
            next(err);
        }
    }
    static async checkOut(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                throw new apiResponse_1.AppError('This account is a standalone administrative user without a linked employee record. Personal punch clock is active for employee accounts.', 400, 'NO_EMPLOYEE_LINK');
            }
            const timestamp = req.body.timestamp;
            const record = await attendance_service_1.AttendanceService.checkOut(req.user.employeeId, timestamp);
            return (0, apiResponse_1.sendSuccess)(res, record, 'Checked out successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async updateAttendance(req, res, next) {
        try {
            const id = req.params.id;
            const updated = await attendance_service_1.AttendanceService.updateAttendanceRecord(id, req.body);
            return (0, apiResponse_1.sendSuccess)(res, updated, 'Attendance record updated successfully');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AttendanceController = AttendanceController;
//# sourceMappingURL=attendance.controller.js.map