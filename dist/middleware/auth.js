"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../shared/errors");
const requireAuth = async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new errors_1.UnauthorizedError('Missing or invalid authorization header');
    }
    const token = authHeader.split(' ')[1];
    try {
        const secret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Inject user context into request
        request.user = {
            id: decoded.id,
            orgId: decoded.orgId,
            email: decoded.email,
            roleId: decoded.roleId,
            permissions: decoded.permissions || [],
        };
    }
    catch (error) {
        throw new errors_1.UnauthorizedError('Invalid or expired token');
    }
};
exports.requireAuth = requireAuth;
const requirePermission = (requiredPermission) => {
    return async (request, reply) => {
        // First ensure they are authenticated
        await (0, exports.requireAuth)(request, reply);
        if (!request.user) {
            throw new errors_1.UnauthorizedError();
        }
        if (!request.user.permissions.includes(requiredPermission)) {
            throw new errors_1.ForbiddenError(`Missing required permission: ${requiredPermission}`);
        }
    };
};
exports.requirePermission = requirePermission;
