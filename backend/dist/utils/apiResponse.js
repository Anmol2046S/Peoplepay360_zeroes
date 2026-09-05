"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 400, code = 'BAD_REQUEST', details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
function sendSuccess(reply, data, message = 'Operation completed successfully', statusCode = 200) {
    if (reply && typeof reply.status === 'function') {
        return reply.status(statusCode).send({
            success: true,
            data,
            message,
        });
    }
    return { success: true, data, message };
}
function sendError(reply, message, statusCode = 400, code = 'INTERNAL_ERROR', details) {
    if (reply && typeof reply.status === 'function') {
        return reply.status(statusCode).send({
            success: false,
            error: {
                code,
                message,
                details: details || null,
            },
        });
    }
    return { success: false, error: { code, message, details: details || null } };
}
