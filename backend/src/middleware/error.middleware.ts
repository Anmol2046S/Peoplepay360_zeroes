import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || null,
      },
    });
  }

  logger.error('Unhandled System Error:', err);

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
