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
        const input = attendance_schema_1.CheckInSchema.parse(request.body);
        const orgId = request.user.orgId;
        // In a real app, an employee role should only be able to check-in for themselves.
        // Assuming higher roles can create for anyone.
        const result = await this.attendanceService.checkIn(orgId, input);
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
        const { employeeId } = request.params;
        const records = await this.attendanceService.getByEmployee(orgId, employeeId);
        return reply.send({ success: true, data: records });
    };
}
exports.AttendanceController = AttendanceController;
