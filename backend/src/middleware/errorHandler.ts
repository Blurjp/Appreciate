import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err.message);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        message: err.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      },
    });
    return;
  }

  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      success: false,
      error: { message: 'CORS not allowed', code: 'CORS_ERROR' },
    });
    return;
  }

  const status = (err as any).status || 500;
  res.status(status).json({
    success: false,
    error: {
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err.message,
      code: 'INTERNAL_ERROR',
    },
  });
}
