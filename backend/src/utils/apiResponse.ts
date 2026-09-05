import { FastifyReply } from 'fastify';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function sendSuccess(reply: FastifyReply | any, data: any, message: string = 'Operation completed successfully', statusCode: number = 200) {
  if (reply && typeof reply.status === 'function') {
    return reply.status(statusCode).send({
      success: true,
      data,
      message,
    });
  }
  return { success: true, data, message };
}

export function sendError(reply: FastifyReply | any, message: string, statusCode: number = 400, code: string = 'INTERNAL_ERROR', details?: any) {
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
