import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { EmployeeService } from '../services/employee.service';
import { sendSuccess } from '../utils/apiResponse';
import { AccountStatus } from '@prisma/client';

export class EmployeeController {
  static async getAllEmployees(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const departmentId = req.query.departmentId as string;
      const status = req.query.status as AccountStatus;
      const view = req.query.view as 'kanban' | 'list';

      const employees = await EmployeeService.getAllEmployees({ search, departmentId, status, view });
      return sendSuccess(res, employees, 'Employees fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getEmployeeById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const employee = await EmployeeService.getEmployeeById(id);
      return sendSuccess(res, employee, 'Employee fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createEmployee(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const newEmp = await EmployeeService.createEmployee(req.body);
      return sendSuccess(res, newEmp, 'Employee master record created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateEmployee(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const updated = await EmployeeService.updateEmployee(id, req.body);
      return sendSuccess(res, updated, 'Employee updated successfully');
    } catch (err) {
      next(err);
    }
  }
}
