import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AppError } from '../utils/apiResponse';
import { SystemRole } from '@prisma/client';

/**
 * Middleware factory for Role-Based Access Control (RBAC).
 * Enforces allowed roles. Admin role always bypasses checks.
 */
export function requireRole(allowedRoles: SystemRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (req.user.role === SystemRole.ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(`Forbidden: Access denied for role ${req.user.role}`, 403, 'FORBIDDEN'));
    }

    next();
  };
}

/**
 * Middleware for Employee Self-Ownership check.
 * Allows employees to access only records where employeeId matches their own employeeId.
 * Higher roles (HR Manager, HR Payroll User, HR Payroll Manager, Admin) bypass self check.
 */
export function requireSelfOrRole(allowedRolesForOthers: SystemRole[], getTargetEmployeeId: (req: AuthRequest) => string | undefined) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const role = req.user.role;
    if (role === SystemRole.ADMIN || allowedRolesForOthers.includes(role)) {
      return next();
    }

    const targetEmpId = getTargetEmployeeId(req);
    if (role === SystemRole.EMPLOYEE && req.user.employeeId && req.user.employeeId === targetEmpId) {
      return next();
    }

    return next(new AppError('Forbidden: You can only access your own employee records.', 403, 'FORBIDDEN'));
  };
}
