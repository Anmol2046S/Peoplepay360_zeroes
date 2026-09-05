import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AttendanceService } from '../services/attendance.service';
import { sendSuccess, AppError } from '../utils/apiResponse';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceController {
  static async getAllAttendance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let employeeId = req.query.employeeId as string;
      const date = req.query.date as string;
      const status = req.query.status as AttendanceStatus;

      // Employee role can view only own attendance records
      if (req.user?.role === 'EMPLOYEE') {
        if (!req.user.employeeId) {
          throw new AppError('Employee profile not linked to user account.', 400, 'NO_EMPLOYEE_LINK');
        }
        employeeId = req.user.employeeId;
      }

      const records = await AttendanceService.getAllAttendance({ employeeId, date, status });
      return sendSuccess(res, records, 'Attendance records fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getActiveSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.employeeId) {
        return sendSuccess(res, null, 'No linked employee profile for active session');
      }
      const active = await AttendanceService.getActiveSession(req.user.employeeId);
      return sendSuccess(res, active, 'Active session status fetched');
    } catch (err) {
      next(err);
    }
  }

  static async checkIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.employeeId) {
        throw new AppError(
          'This account is a standalone administrative user without a linked employee record. Personal punch clock is active for employee accounts.',
          400,
          'NO_EMPLOYEE_LINK'
        );
      }
      const timestamp = req.body.timestamp;
      const record = await AttendanceService.checkIn(req.user.employeeId, timestamp);
      return sendSuccess(res, record, 'Checked in successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async checkOut(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.employeeId) {
        throw new AppError(
          'This account is a standalone administrative user without a linked employee record. Personal punch clock is active for employee accounts.',
          400,
          'NO_EMPLOYEE_LINK'
        );
      }
      const timestamp = req.body.timestamp;
      const record = await AttendanceService.checkOut(req.user.employeeId, timestamp);
      return sendSuccess(res, record, 'Checked out successfully');
    } catch (err) {
      next(err);
    }
  }

  static async updateAttendance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const updated = await AttendanceService.updateAttendanceRecord(id, req.body);
      return sendSuccess(res, updated, 'Attendance record updated successfully');
    } catch (err) {
      next(err);
    }
  }
}
