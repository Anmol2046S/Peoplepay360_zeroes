"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const attendance_service_1 = require("./attendance.service");
const attendance_schema_1 = require("./attendance.schema");
class AttendanceController {
    attendanceService;
    constructor() {
        this.attendanceService = new attendance_service_1.AttendanceService();
    }
    checkIn = async (request, reply) => {
        const body = (request.body || {});
        const employeeId = body.employeeId || request.user?.id || '';
        const date = body.date || new Date().toISOString();
        const checkInTime = body.checkIn || new Date().toISOString();
        const input = attendance_schema_1.CheckInSchema.parse({
            employeeId,
            date,
            checkIn: checkInTime,
        });
        const orgId = request.user.orgId;
        const result = await this.attendanceService.checkIn(orgId, input, request.user.id);
        return reply.status(201).send({ success: true, data: result });
    };
    checkOut = async (request, reply) => {
        const input = attendance_schema_1.CheckOutSchema.parse(request.body);
        const orgId = request.user.orgId;
        const { id } = request.params;
        const result = await this.attendanceService.checkOut(orgId, id, input);
        return reply.send({ success: true, data: result });
    };
    getByEmployee = async (request, reply) => {
        const orgId = request.user.orgId;
        let { employeeId } = request.params;
        if (!employeeId || employeeId === 'undefined' || employeeId === 'me') {
            employeeId = request.user.id;
        }
        const records = await this.attendanceService.getByEmployee(orgId, employeeId, request.user.id);
        return reply.send({ success: true, data: records });
    };
    getAll = async (request, reply) => {
        const orgId = request.user.orgId;
        const permissions = request.user?.permissions || [];
        // If caller is Employee (has ATTENDANCE_SELF but not ATTENDANCE_READ), scope to own attendance records
        if (permissions.includes('ATTENDANCE_SELF') && !permissions.includes('ATTENDANCE_READ')) {
            const records = await this.attendanceService.getByEmployee(orgId, request.user.id, request.user.id);
            return reply.send({ success: true, data: records });
        }
        const records = await this.attendanceService.getAll(orgId);
        return reply.send({ success: true, data: records });
    };
}
exports.AttendanceController = AttendanceController;
