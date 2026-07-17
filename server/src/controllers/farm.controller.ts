import type { Request, Response } from 'express';
import { farmService } from '../services/farm.service';

export const farmController = {
  async list(req: Request, res: Response) {
    const search = (req.query.search as string) || undefined;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const result = await farmService.list(search, page, pageSize);
    res.json(result);
  },

  async get(req: Request, res: Response) {
    const farm = await farmService.get(req.params.id);
    res.json(farm);
  },

  async create(req: Request, res: Response) {
    const farm = await farmService.create(req.body);
    res.status(201).json(farm);
  },

  async update(req: Request, res: Response) {
    const farm = await farmService.update(req.params.id, req.body);
    res.json(farm);
  },

  async delete(req: Request, res: Response) {
    await farmService.delete(req.params.id);
    res.status(204).send();
  },
};
