import { prisma } from '../../database/db';
import { CreateEmployeeInput, UpdateEmployeeInput } from './employee.schema';
import { NotFoundError } from '../../shared/errors';

export class EmployeeService {
  async create(orgId: string, input: CreateEmployeeInput) {
    return prisma.employee.create({
      data: {
        orgId,
        firstName: input.firstName,
        lastName: input.lastName,
        userId: input.userId,
        status: input.status,
      },
    });
  }

  async getAll(orgId: string) {
    return prisma.employee.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(orgId: string, id: string) {
    const employee = await prisma.employee.findFirst({
      where: { id, orgId },
      include: {
        contracts: true,
      },
    });

    if (!employee) {
      throw new NotFoundError(`Employee with id ${id} not found`);
    }

    return employee;
  }

  async update(orgId: string, id: string, input: UpdateEmployeeInput) {
    const existing = await prisma.employee.findFirst({ where: { id, orgId } });
    if (!existing) {
      throw new NotFoundError(`Employee with id ${id} not found`);
    }

    return prisma.employee.update({
      where: { id },
      data: input,
    });
  }
}
