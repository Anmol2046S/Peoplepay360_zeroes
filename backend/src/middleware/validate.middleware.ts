import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/apiResponse';

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return next(new AppError('Validation Error', 400, 'VALIDATION_ERROR', issues));
      }
      next(err);
    }
  };
}
