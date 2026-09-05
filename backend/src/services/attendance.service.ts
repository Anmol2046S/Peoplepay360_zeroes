import { prisma } from '../config/database';
import { AppError } from '../utils/apiResponse';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceService {
  static async getAllAttendance(query: { employeeId?: string; date?: string; status?: AttendanceStatus }) {
    const where: any = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status) where.status = query.status;
    if (query.date) {
      const d = new Date(query.date);
      where.date = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, jobPosition: true, department: { select: { name: true } } } },
      },
      orderBy: { checkIn: 'desc' },
    });

    return records;
  }

  static async getActiveSession(employeeId: string) {
    const active = await prisma.attendance.findFirst({
      where: {
        employeeId,
        checkOut: null,
      },
      orderBy: { checkIn: 'desc' },
    });

    return active;
  }

  static async checkIn(employeeId: string, timestamp?: string) {
    const checkInDate = timestamp ? new Date(timestamp) : new Date();
    const dateOnly = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());

    // Check if already checked in without checkOut
    const activeSession = await this.getActiveSession(employeeId);
    if (activeSession) {
      throw new AppError('You are already checked in. Please check out first.', 400, 'ALREADY_CHECKED_IN');
    }

    // Check unique date constraint
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: dateOnly,
        },
      },
    });

    if (existing && existing.checkOut !== null) {
      throw new AppError('Attendance record already exists for today.', 400, 'ATTENDANCE_EXISTS');
    }

    const record = await prisma.attendance.create({
      data: {
        employeeId,
        date: dateOnly,
        checkIn: checkInDate,
        status: AttendanceStatus.PRESENT,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return record;
  }

  static async checkOut(employeeId: string, timestamp?: string) {
    const activeSession = await this.getActiveSession(employeeId);
    if (!activeSession) {
      throw new AppError('No active check-in session found to check out.', 400, 'NO_ACTIVE_SESSION');
    }

    const checkOutDate = timestamp ? new Date(timestamp) : new Date();
    const diffMs = checkOutDate.getTime() - activeSession.checkIn.getTime();
    const workedHours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);

    // Standard day expected hours is 8.0
    const expectedHours = 8.0;
    let overtimeHours = 0;
    let status: AttendanceStatus = AttendanceStatus.PRESENT;

    if (workedHours > expectedHours) {
      overtimeHours = Math.round((workedHours - expectedHours) * 100) / 100;
      status = AttendanceStatus.OVERTIME;
    }

    const updated = await prisma.attendance.update({
      where: { id: activeSession.id },
      data: {
        checkOut: checkOutDate,
        workedHours,
        overtimeHours,
        status,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return updated;
  }

  static async updateAttendanceRecord(id: string, data: { checkIn?: string; checkOut?: string; notes?: string; status?: AttendanceStatus }) {
    const record = await prisma.attendance.findUnique({ where: { id } });
    if (!record) {
      throw new AppError('Attendance record not found.', 404, 'RECORD_NOT_FOUND');
    }

    const checkInDate = data.checkIn ? new Date(data.checkIn) : record.checkIn;
    const checkOutDate = data.checkOut ? new Date(data.checkOut) : record.checkOut;

    let workedHours = record.workedHours;
    let overtimeHours = record.overtimeHours;

    if (checkOutDate && checkInDate) {
      const diffMs = checkOutDate.getTime() - checkInDate.getTime();
      workedHours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
      overtimeHours = workedHours > 8.0 ? Math.round((workedHours - 8.0) * 100) / 100 : 0;
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        workedHours,
        overtimeHours,
        status: data.status !== undefined ? data.status : record.status,
        notes: data.notes !== undefined ? data.notes : record.notes,
        isManualEdit: true,
      },
      include: {
        employee: true,
      },
    });

    return updated;
  }
}
