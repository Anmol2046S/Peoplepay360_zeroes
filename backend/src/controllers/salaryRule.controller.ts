import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';
import { sendSuccess, AppError } from '../utils/apiResponse';

export class SalaryRuleController {
  static async getAllRules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const salaryStructureId = req.query.salaryStructureId as string;
      const where: any = {};
      if (salaryStructureId) where.salaryStructureId = salaryStructureId;

      const rules = await prisma.salaryRule.findMany({
        where,
        include: {
          salaryStructure: { select: { id: true, name: true, code: true } },
        },
        orderBy: { sequence: 'asc' },
      });

      return sendSuccess(res, rules, 'Salary rules fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createRule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, code, category, sequence, computationMethod, amount, percentage, percentageBase, formula, salaryStructureId } = req.body;

      const newRule = await prisma.salaryRule.create({
        data: {
          name,
          code,
          category,
          sequence: parseInt(sequence, 10),
          computationMethod,
          amount: amount ? parseFloat(amount) : null,
          percentage: percentage ? parseFloat(percentage) : null,
          percentageBase,
          formula,
          salaryStructureId,
        },
        include: {
          salaryStructure: true,
        },
      });

      return sendSuccess(res, newRule, 'Salary rule created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateRule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const rule = await prisma.salaryRule.findUnique({ where: { id } });
      if (!rule) {
        throw new AppError('Salary rule not found.', 404, 'RULE_NOT_FOUND');
      }

      const updated = await prisma.salaryRule.update({
        where: { id },
        data: req.body,
      });

      return sendSuccess(res, updated, 'Salary rule updated successfully');
    } catch (err) {
      next(err);
    }
  }
}
