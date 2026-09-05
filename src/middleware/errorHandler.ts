import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../shared/errors';
import { auditLogError } from '../shared/auditLogger';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error(error);

  if (error instanceof AppError) {
    const errorData = {
      code: error.code,
      message: error.message,
      details: error.details,
      requestId: request.id,
      path: request.url,
      method: request.method,
    };
    auditLogError(errorData);
    return reply.status(error.statusCode).send({
      success: false,
      error: errorData,
    });
  }

  // Handle Fastify Validation Errors (Zod)
  if (error.validation) {
    const errorData = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request payload',
      details: error.validation,
      requestId: request.id,
      path: request.url,
      method: request.method,
    };
    auditLogError(errorData);
    return reply.status(400).send({
      success: false,
      error: errorData,
    });
  }

  const errorData = {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred.',
    requestId: request.id,
    path: request.url,
    method: request.method,
    rawError: error.message,
  };
  auditLogError(errorData);
  return reply.status(500).send({
    success: false,
    error: {
      code: errorData.code,
      message: errorData.message,
      requestId: errorData.requestId,
    },
  });
};

