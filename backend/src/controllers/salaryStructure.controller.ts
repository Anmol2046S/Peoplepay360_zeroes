import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';
import { sendSuccess, AppError } from '../utils/apiResponse';

export class SalaryStructureController {
  static async getAllStructures(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const structures = await prisma.salaryStructure.findMany({
        include: {
          rules: { orderBy: { sequence: 'asc' } },
          _count: { select: { contracts: true, payruns: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = structures.map(s => ({
        ...s,
        ruleCount: s.rules.length,
        employeeCount: s._count.contracts,
      }));

      return sendSuccess(res, formatted, 'Salary structures fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getStructureById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const structure = await prisma.salaryStructure.findUnique({
        where: { id },
        include: {
          rules: { orderBy: { sequence: 'asc' } },
          contracts: { include: { employee: true } },
        },
      });

      if (!structure) {
        throw new AppError(`Salary structure with ID ${id} not found.`, 404, 'STRUCTURE_NOT_FOUND');
      }

      return sendSuccess(res, structure, 'Salary structure details fetched');
    } catch (err) {
      next(err);
    }
  }

  static async createStructure(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, code, description } = req.body;
      const existing = await prisma.salaryStructure.findUnique({ where: { code } });
      if (existing) {
        throw new AppError(`Structure code ${code} already exists.`, 400, 'CODE_EXISTS');
      }

      const newStruct = await prisma.salaryStructure.create({
        data: { name, code, description },
      });

      return sendSuccess(res, newStruct, 'Salary structure created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}
