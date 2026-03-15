import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { error } from '../utils/response';

export function validate(schema: ZodSchema, source: 'body' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.errors.map((e) => e.message).join(', ');
      error(res, message, 'VALIDATION_ERROR', 400);
      return;
    }
    // Replace with parsed/coerced values
    if (source === 'body') {
      req.body = result.data;
    } else {
      (req as any).validatedQuery = result.data;
    }
    next();
  };
}
