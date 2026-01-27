import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  errors?: Record<string, string>;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    const errors: Record<string, string> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.');
      errors[path] = e.message;
    });
    res.status(400).json({ error: 'Validation failed', errors });
    return;
  }

  if (err.statusCode) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
