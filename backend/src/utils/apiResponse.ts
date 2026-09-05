import { Response } from 'express';

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

export function sendSuccess(res: Response, data: any, message: string = 'Operation completed successfully', statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

export function sendError(res: Response, message: string, statusCode: number = 400, code: string = 'INTERNAL_ERROR', details?: any) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: details || null,
    },
  });
}
