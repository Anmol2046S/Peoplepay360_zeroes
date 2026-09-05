"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.requireSelfOrRole = requireSelfOrRole;
exports.forbidRole = forbidRole;
const apiResponse_1 = require("../utils/apiResponse");
const client_1 = require("@prisma/client");
/**
 * Middleware factory for Role-Based Access Control (RBAC).
 * Enforces allowed roles. Admin role always bypasses checks.
 */
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new apiResponse_1.AppError('Authentication required.', 401, 'UNAUTHORIZED'));
        }
        if (req.user.role === client_1.SystemRole.ADMIN) {
            return next();
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new apiResponse_1.AppError(`Forbidden: Access denied for role ${req.user.role}`, 403, 'FORBIDDEN'));
        }
        next();
    };
}
/**
 * Middleware for Employee Self-Ownership check.
 * Allows employees to access only records where employeeId matches their own employeeId.
 * Higher roles (HR Manager, HR Payroll User, HR Payroll Manager, Admin) bypass self check.
 */
function requireSelfOrRole(allowedRolesForOthers, getTargetEmployeeId) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new apiResponse_1.AppError('Authentication required.', 401, 'UNAUTHORIZED'));
        }
        const role = req.user.role;
        if (role === client_1.SystemRole.ADMIN || allowedRolesForOthers.includes(role)) {
            return next();
        }
        const targetEmpId = getTargetEmployeeId(req);
        if (role === client_1.SystemRole.EMPLOYEE && req.user.employeeId && req.user.employeeId === targetEmpId) {
            return next();
        }
        return next(new apiResponse_1.AppError('Forbidden: You can only access your own employee records.', 403, 'FORBIDDEN'));
    };
}
/**
 * Middleware to explicitly forbid specific roles from executing an endpoint.
 * Useful for locking down Admin Portal operational mutation actions (e.g. read-only Time Off).
 */
function forbidRole(forbiddenRoles, customMessage) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new apiResponse_1.AppError('Authentication required.', 401, 'UNAUTHORIZED'));
        }
        if (forbiddenRoles.includes(req.user.role)) {
            return next(new apiResponse_1.AppError(customMessage || `Forbidden: Access denied for role ${req.user.role}`, 403, 'FORBIDDEN'));
        }
        next();
    };
}
//# sourceMappingURL=rbac.middleware.js.map