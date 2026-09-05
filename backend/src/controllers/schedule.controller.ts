import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ScheduleService } from '../services/schedule.service';
import { sendSuccess } from '../utils/apiResponse';

export class ScheduleController {
  static async getAllSchedules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const schedules = await ScheduleService.getAllSchedules();
      return sendSuccess(res, schedules, 'Working schedules fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getScheduleById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const schedule = await ScheduleService.getScheduleById(id);
      return sendSuccess(res, schedule, 'Working schedule fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const newSchedule = await ScheduleService.createSchedule(req.body);
      return sendSuccess(res, newSchedule, 'Working schedule created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}
