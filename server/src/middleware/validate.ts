import type { Request, Response, NextFunction } from 'express';
import { z, type ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Request body failed validation',
        errors: z.flattenError(result.error).fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
