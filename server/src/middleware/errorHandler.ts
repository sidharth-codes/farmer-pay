import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status ?? 500;
  res.status(status).json({
    code: err.code ?? 'INTERNAL_ERROR',
    message: err.message ?? 'An unexpected error occurred',
  });
}
