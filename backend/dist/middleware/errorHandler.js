"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../shared/errors");
const errorHandler = (error, request, reply) => {
    request.log.error(error);
    if (error instanceof errors_1.AppError) {
        return reply.status(error.statusCode).send({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
                requestId: request.id,
            },
        });
    }
    // Handle Fastify Validation Errors (Zod)
    if (error.validation) {
        return reply.status(400).send({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request payload',
                details: error.validation,
                requestId: request.id,
            },
        });
    }
    return reply.status(500).send({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred.',
            requestId: request.id,
        },
    });
};
exports.errorHandler = errorHandler;
