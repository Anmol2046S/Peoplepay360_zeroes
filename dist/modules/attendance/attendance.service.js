"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const db_1 = require("../../database/db");
const errors_1 = require("../../shared/errors");
const decimal_js_1 = require("decimal.js");
class AttendanceService {
    async checkIn(orgId, input) {
        const employee = await db_1.prisma.employee.findFirst({
            where: { id: input.employeeId, orgId },
        });
        if (!employee)
            throw new errors_1.NotFoundError('Employee not found');
        const date = new Date(input.date);
        date.setUTCHours(0, 0, 0, 0); // Normalize to date boundaries
        const existing = await db_1.prisma.attendance.findUnique({
            where: {
                employeeId_date: {
                    employeeId: input.employeeId,
                    date,
                },
            },
        });
        if (existing) {
            throw new errors_1.DuplicateResourceError('Attendance record already exists for this date');
        }
        return db_1.prisma.attendance.create({
            data: {
                employeeId: input.employeeId,
                date,
                checkIn: new Date(input.checkIn),
                status: 'PRESENT',
            },
        });
    }
    async checkOut(orgId, id, input) {
        const record = await db_1.prisma.attendance.findUnique({
            where: { id },
            include: { employee: true },
        });
        if (!record || record.employee.orgId !== orgId) {
            throw new errors_1.NotFoundError('Attendance record not found');
        }
        if (record.checkOut) {
            throw new errors_1.ValidationError('Already checked out');
        }
        const checkOut = new Date(input.checkOut);
        if (checkOut <= record.checkIn) {
            throw new errors_1.ValidationError('Checkout time must be after check-in time');
        }
        // Calculate duration in hours
        const durationMs = checkOut.getTime() - record.checkIn.getTime();
        const hours = new decimal_js_1.Decimal(durationMs).dividedBy(1000 * 60 * 60).toDecimalPlaces(2);
        return db_1.prisma.attendance.update({
            where: { id },
            data: {
                checkOut,
                workedHours: hours,
            },
        });
    }
    async getByEmployee(orgId, employeeId) {
        const employee = await db_1.prisma.employee.findFirst({
            where: { id: employeeId, orgId },
        });
        if (!employee)
            throw new errors_1.NotFoundError('Employee not found');
        return db_1.prisma.attendance.findMany({
            where: { employeeId },
            orderBy: { date: 'desc' },
        });
    }
}
exports.AttendanceService = AttendanceService;
