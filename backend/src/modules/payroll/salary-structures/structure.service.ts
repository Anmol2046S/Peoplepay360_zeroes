import { prisma } from '../../../database/db';
import { CreateStructureInput, UpdateStructureInput } from './structure.schema';
import { NotFoundError } from '../../../shared/errors';

export class StructureService {
  async create(orgId: string, input: CreateStructureInput) {
    return prisma.salaryStructure.create({
      data: {
        orgId,
        name: input.name,
      },
    });
  }

  async getAll(orgId: string) {
    return prisma.salaryStructure.findMany({
      where: { orgId },
      include: {
        rules: {
          orderBy: { sequence: 'asc' },
        },
      },
    });
  }

  async getById(orgId: string, id: string) {
    const structure = await prisma.salaryStructure.findFirst({
      where: { id, orgId },
      include: {
        rules: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!structure) throw new NotFoundError('Salary structure not found');
    return structure;
  }

  async update(orgId: string, id: string, input: UpdateStructureInput) {
    const structure = await prisma.salaryStructure.findFirst({
      where: { id, orgId },
    });

    if (!structure) throw new NotFoundError('Salary structure not found');

    return prisma.salaryStructure.update({
      where: { id },
      data: {
        name: input.name,
        // In a real app, updating a structure might bump the version number
        version: { increment: 1 },
      },
    });
  }
}
