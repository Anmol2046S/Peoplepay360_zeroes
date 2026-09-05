"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleController = void 0;
const schedule_service_1 = require("../services/schedule.service");
const apiResponse_1 = require("../utils/apiResponse");
class ScheduleController {
    static async getAllSchedules(req, res, next) {
        try {
            const schedules = await schedule_service_1.ScheduleService.getAllSchedules();
            return (0, apiResponse_1.sendSuccess)(res, schedules, 'Working schedules fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getScheduleById(req, res, next) {
        try {
            const id = req.params.id;
            const schedule = await schedule_service_1.ScheduleService.getScheduleById(id);
            return (0, apiResponse_1.sendSuccess)(res, schedule, 'Working schedule fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async createSchedule(req, res, next) {
        try {
            const newSchedule = await schedule_service_1.ScheduleService.createSchedule(req.body);
            return (0, apiResponse_1.sendSuccess)(res, newSchedule, 'Working schedule created successfully', 201);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ScheduleController = ScheduleController;
//# sourceMappingURL=schedule.controller.js.map