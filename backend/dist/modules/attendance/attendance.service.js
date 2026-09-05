"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const db_1 = require("../../database/db");
const errors_1 = require("../../shared/errors");
const decimal_js_1 = require("decimal.js");
class AttendanceService {
    async checkIn(orgId, input, requestUserId) {
        const employee = await db_1.prisma.employee.findFirst({
            where: {
                orgId,
                OR: [
                    { id: input.employeeId },
                    { userId: input.employeeId },
                    ...(requestUserId ? [{ userId: requestUserId }] : [])
                ]
            },
        });
        if (!employee)
            throw new errors_1.NotFoundError('Employee record not found for current user session');
        const date = new Date(input.date);
        date.setUTCHours(0, 0, 0, 0); // Normalize to date boundaries
        const existing = await db_1.prisma.attendance.findUnique({
            where: {
                employeeId_date: {
                    employeeId: employee.id,
                    date,
                },
            },
        });
        if (existing) {
            if (!existing.checkOut) {
                return existing;
            }
            return db_1.prisma.attendance.update({
                where: { id: existing.id },
                data: {
                    checkIn: new Date(input.checkIn),
                    checkOut: null,
                    workedHours: new decimal_js_1.Decimal(0),
                    status: 'PRESENT',
                },
            });
        }
        return db_1.prisma.attendance.create({
            data: {
                employeeId: employee.id,
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
        const checkOut = new Date(input.checkOut);
        const durationMs = Math.max(0, checkOut.getTime() - record.checkIn.getTime());
        const hours = new decimal_js_1.Decimal(durationMs).dividedBy(1000 * 60 * 60).toDecimalPlaces(2);
        return db_1.prisma.attendance.update({
            where: { id },
            data: {
                checkOut,
                workedHours: hours,
            },
        });
    }
    async getByEmployee(orgId, employeeIdOrUserId, requestUserId) {
        const employee = await db_1.prisma.employee.findFirst({
            where: {
                orgId,
                OR: [
                    { id: employeeIdOrUserId },
                    { userId: employeeIdOrUserId },
                    ...(requestUserId ? [{ userId: requestUserId }] : [])
                ]
            },
        });
        if (!employee)
            return [];
        return db_1.prisma.attendance.findMany({
            where: { employeeId: employee.id },
            include: { employee: { include: { user: true } } },
            orderBy: { date: 'desc' },
        });
    }
    async getAll(orgId) {
        return db_1.prisma.attendance.findMany({
            where: { employee: { orgId } },
            include: { employee: true },
            orderBy: { date: 'desc' },
        });
    }
}
exports.AttendanceService = AttendanceService;
