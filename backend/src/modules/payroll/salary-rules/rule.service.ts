import { prisma } from '../../../database/db';
import { CreateRuleInput, UpdateRuleInput } from './rule.schema';
import { NotFoundError, ValidationError } from '../../../shared/errors';
import { Decimal } from 'decimal.js';

export class RuleService {
  async create(orgId: string, input: CreateRuleInput) {
    const structure = await prisma.salaryStructure.findFirst({
      where: { id: input.structureId, orgId },
    });
    if (!structure) throw new NotFoundError('Salary structure not found');

    // Check for sequence collisions
    const existingRuleAtSequence = await prisma.salaryRule.findFirst({
      where: { structureId: input.structureId, sequence: input.sequence },
    });
    if (existingRuleAtSequence) {
      throw new ValidationError(`Sequence ${input.sequence} is already occupied by rule ${existingRuleAtSequence.code}`);
    }

    // Check code uniqueness within structure
    const existingCode = await prisma.salaryRule.findUnique({
      where: {
        structureId_code: { structureId: input.structureId, code: input.code },
      },
    });
    if (existingCode) {
      throw new ValidationError(`Rule code ${input.code} already exists in this structure`);
    }

    return prisma.salaryRule.create({
      data: {
        structureId: input.structureId,
        code: input.code,
        name: input.name,
        category: input.category,
        computationType: input.computationType,
        sequence: input.sequence,
        value: input.value ? new Decimal(input.value) : null,
        dependsOn: input.dependsOn,
      },
    });
  }

  async getByStructureId(orgId: string, structureId: string) {
    const structure = await prisma.salaryStructure.findFirst({
      where: { id: structureId, orgId },
    });
    if (!structure) throw new NotFoundError('Salary structure not found');

    return prisma.salaryRule.findMany({
      where: { structureId },
      orderBy: { sequence: 'asc' },
    });
  }
}
