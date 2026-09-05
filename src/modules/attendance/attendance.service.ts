import { prisma } from '../../database/db';
import { CheckInInput, CheckOutInput } from './attendance.schema';
import { NotFoundError, DuplicateResourceError, ValidationError } from '../../shared/errors';
import { Decimal } from 'decimal.js';

export class AttendanceService {
  async checkIn(orgId: string, input: CheckInInput) {
    const employee = await prisma.employee.findFirst({
      where: { id: input.employeeId, orgId },
    });
    if (!employee) throw new NotFoundError('Employee not found');

    const date = new Date(input.date);
    date.setUTCHours(0, 0, 0, 0); // Normalize to date boundaries

    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: input.employeeId,
          date,
        },
      },
    });

    if (existing) {
      throw new DuplicateResourceError('Attendance record already exists for this date');
    }

    return prisma.attendance.create({
      data: {
        employeeId: input.employeeId,
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

    if (record.checkOut) {
      throw new ValidationError('Already checked out');
    }

    const checkOut = new Date(input.checkOut);
    if (checkOut <= record.checkIn) {
      throw new ValidationError('Checkout time must be after check-in time');
    }

    // Calculate duration in hours
    const durationMs = checkOut.getTime() - record.checkIn.getTime();
    const hours = new Decimal(durationMs).dividedBy(1000 * 60 * 60).toDecimalPlaces(2);

    return prisma.attendance.update({
      where: { id },
      data: {
        checkOut,
        workedHours: hours,
      },
    });
  }

  async getByEmployee(orgId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, orgId },
    });
    if (!employee) throw new NotFoundError('Employee not found');

    return prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' },
    });
  }

  async getAll(orgId: string) {
    const records = await prisma.attendance.findMany({
      where: { employee: { orgId } },
      include: {
        employee: true,
      },
      orderBy: { date: 'desc' },
      take: 250,
    });

    return records.map((a) => {
      const checkInStr = a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
      const checkOutStr = a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
      return {
        id: a.id,
        date: a.date.toISOString().split('T')[0],
        checkIn: a.checkIn.toISOString(),
        checkOut: a.checkOut ? a.checkOut.toISOString() : null,
        workedHours: a.workedHours ? Number(a.workedHours) : 0,
        status: a.status,
        employeeId: a.employeeId,
        employeeName: `${a.employee.firstName} ${a.employee.lastName}`,
        employee: {
          id: a.employee.id,
          firstName: a.employee.firstName,
          lastName: a.employee.lastName,
          employeeCode: `EMP-${a.employee.firstName[0]}${a.employee.lastName[0]}`,
        },
        timeIn: checkInStr,
        timeOut: checkOutStr,
      };
    });
  }
}
