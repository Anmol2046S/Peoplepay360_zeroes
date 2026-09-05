"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = require("../utils/logger");
function errorHandler(err, req, res, next) {
    if (err instanceof apiResponse_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details || null,
            },
        });
    }
    logger_1.logger.error('Unhandled System Error:', err);
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const message = process.env.NODE_ENV === 'production'
        ? 'An unexpected system error occurred.'
        : err.message || 'Internal server error';
    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            details: null,
        },
    });
}
//# sourceMappingURL=error.middleware.js.map