import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/apiResponse';
import { SystemRole } from '@prisma/client';

export class UserController {
  static async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const role = req.query.role as SystemRole;
      const users = await UserService.getAllUsers(search, role);
      return sendSuccess(res, users, 'Users fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const newUser = await UserService.createUser(req.body);
      return sendSuccess(res, newUser, 'User account created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const updated = await UserService.updateUser(id, req.body);
      return sendSuccess(res, updated, 'User updated successfully');
    } catch (err) {
      next(err);
    }
  }
}
