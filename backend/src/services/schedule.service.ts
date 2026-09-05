import { prisma } from '../config/database';
import { AppError } from '../utils/apiResponse';
import { AccountStatus } from '@prisma/client';

export class ScheduleService {
  static async getAllSchedules() {
    const schedules = await prisma.workingSchedule.findMany({
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

  static async getScheduleById(id: string) {
    const schedule = await prisma.workingSchedule.findUnique({
      where: { id },
      include: {
        days: true,
        employees: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
      },
    });

    if (!schedule) {
      throw new AppError(`Schedule with ID ${id} not found.`, 404, 'SCHEDULE_NOT_FOUND');
    }

    return schedule;
  }

  static async createSchedule(data: {
    name: string;
    company?: string;
    timezone?: string;
    days: Array<{ dayOfWeek: string; startTime: string; endTime: string; breakHours?: number }>;
  }) {
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

    const newSchedule = await prisma.workingSchedule.create({
      data: {
        name: data.name,
        company: data.company || 'My Company',
        timezone: data.timezone || 'Asia/Kolkata',
        daysPerWeek: processedDays.length,
        hoursPerWeek: Math.round(totalWeeklyHours * 10) / 10,
        status: AccountStatus.ACTIVE,
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
