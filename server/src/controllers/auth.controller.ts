import type { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import type { RegisterInput, LoginInput } from '../models/auth.schema';

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body as RegisterInput);
    res.status(201).json(result);
  },
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body as LoginInput);
    res.json(result);
  },
};
