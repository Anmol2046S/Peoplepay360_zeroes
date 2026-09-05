import { prisma } from '../../database/db';
import { CheckInInput, CheckOutInput } from './attendance.schema';
import { NotFoundError } from '../../shared/errors';
import { Decimal } from 'decimal.js';

export class AttendanceService {
  async checkIn(orgId: string, input: CheckInInput, requestUserId?: string) {
    const employee = await prisma.employee.findFirst({
      where: {
        orgId,
        OR: [
          { id: input.employeeId },
          { userId: input.employeeId },
          ...(requestUserId ? [{ userId: requestUserId }] : [])
        ]
      },
    });
    if (!employee) throw new NotFoundError('Employee record not found for current user session');

    const date = new Date(input.date);
    date.setUTCHours(0, 0, 0, 0); // Normalize to date boundaries

    const existing = await prisma.attendance.findUnique({
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
      return prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkIn: new Date(input.checkIn),
          checkOut: null,
          workedHours: new Decimal(0),
          status: 'PRESENT',
        },
      });
    }

    return prisma.attendance.create({
      data: {
        employeeId: employee.id,
        date,
        checkIn: new Date(input.checkIn),
        status: 'PRESENT',
      },
    });
  }

  async checkOut(orgId: string, id: string, input: CheckOutInput) {
    const record = await prisma.attendance.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!record || record.employee.orgId !== orgId) {
      throw new NotFoundError('Attendance record not found');
    }

    const checkOut = new Date(input.checkOut);
    const durationMs = Math.max(0, checkOut.getTime() - record.checkIn.getTime());
    const hours = new Decimal(durationMs).dividedBy(1000 * 60 * 60).toDecimalPlaces(2);

    return prisma.attendance.update({
      where: { id },
      data: {
        checkOut,
        workedHours: hours,
      },
    });
  }

  async getByEmployee(orgId: string, employeeIdOrUserId: string, requestUserId?: string) {
    const employee = await prisma.employee.findFirst({
      where: { 
        orgId,
        OR: [
          { id: employeeIdOrUserId },
          { userId: employeeIdOrUserId },
          ...(requestUserId ? [{ userId: requestUserId }] : [])
        ]
      },
    });
    if (!employee) return [];

    return prisma.attendance.findMany({
      where: { employeeId: employee.id },
      include: { employee: { include: { user: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async getAll(orgId: string) {
    return prisma.attendance.findMany({
      where: { employee: { orgId } },
      include: { employee: true },
      orderBy: { date: 'desc' },
    });
  }
}
