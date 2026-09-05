"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../config/jwt");
const database_1 = require("../config/database");
const apiResponse_1 = require("../utils/apiResponse");
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new apiResponse_1.AppError('Authentication required. Missing token.', 401, 'UNAUTHORIZED');
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, jwt_1.jwtConfig.secret);
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                employeeId: true,
            },
        });
        if (!user || user.status !== 'ACTIVE') {
            throw new apiResponse_1.AppError('User account is inactive or no longer exists.', 401, 'UNAUTHORIZED');
        }
        let resolvedEmployeeId = user.employeeId;
        if (!resolvedEmployeeId) {
            // Automatic fallback resolution: find matching employee profile by workEmail or user relation
            const matchedEmp = await database_1.prisma.employee.findFirst({
                where: {
                    OR: [
                        { workEmail: user.email },
                        { user: { id: user.id } },
                    ],
                },
            });
            if (matchedEmp) {
                await database_1.prisma.user.update({
                    where: { id: user.id },
                    data: { employeeId: matchedEmp.id },
                });
                resolvedEmployeeId = matchedEmp.id;
            }
        }
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            employeeId: resolvedEmployeeId,
        };
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new apiResponse_1.AppError('Invalid or expired authentication token.', 401, 'UNAUTHORIZED'));
        }
        next(err);
    }
}
//# sourceMappingURL=auth.middleware.js.map