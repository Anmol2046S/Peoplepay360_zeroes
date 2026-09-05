"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
const client_1 = require("@prisma/client");
class ScheduleService {
    static async getAllSchedules() {
        const schedules = await database_1.prisma.workingSchedule.findMany({
            include: {
                days: true,
                _count: {
                    select: { employees: true, contracts: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return schedules;
    }
    static async getScheduleById(id) {
        const schedule = await database_1.prisma.workingSchedule.findUnique({
            where: { id },
            include: {
                days: true,
                employees: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
            },
        });
        if (!schedule) {
            throw new apiResponse_1.AppError(`Schedule with ID ${id} not found.`, 404, 'SCHEDULE_NOT_FOUND');
        }
        return schedule;
    }
    static async createSchedule(data) {
        // Compute hours per week from days pattern
        let totalWeeklyHours = 0;
        const processedDays = data.days.map(d => {
            const startParts = d.startTime.split(':').map(Number);
            const endParts = d.endTime.split(':').map(Number);
            const startMin = startParts[0] * 60 + startParts[1];
            const endMin = endParts[0] * 60 + endParts[1];
            const breakHr = d.breakHours !== undefined ? d.breakHours : 1.0;
            const totalHr = (endMin - startMin) / 60.0;
            const workHr = Math.max(0, totalHr - breakHr);
            totalWeeklyHours += workHr;
            return {
                dayOfWeek: d.dayOfWeek.toUpperCase(),
                startTime: d.startTime,
                endTime: d.endTime,
                breakHours: breakHr,
                workHours: workHr,
            };
        });
        const newSchedule = await database_1.prisma.workingSchedule.create({
            data: {
                name: data.name,
                company: data.company || 'My Company',
                timezone: data.timezone || 'Asia/Kolkata',
                daysPerWeek: processedDays.length,
                hoursPerWeek: Math.round(totalWeeklyHours * 10) / 10,
                status: client_1.AccountStatus.ACTIVE,
                days: {
                    create: processedDays,
                },
            },
            include: {
                days: true,
            },
        });
        return newSchedule;
    }
}
exports.ScheduleService = ScheduleService;
//# sourceMappingURL=schedule.service.js.map