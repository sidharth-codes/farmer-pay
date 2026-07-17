import type { Request, Response } from 'express';
import { harvestService } from '../services/harvest.service';

export const harvestController = {
  async list(req: Request, res: Response) {
    const search = (req.query.search as string) || undefined;
    const farmId = (req.query.farmId as string) || undefined;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const result = await harvestService.list(search, farmId, page, pageSize);
    res.json(result);
  },

  async get(req: Request, res: Response) {
    res.json(await harvestService.get(req.params.id));
  },

  async create(req: Request, res: Response) {
    res.status(201).json(await harvestService.create(req.body));
  },

  async update(req: Request, res: Response) {
    res.json(await harvestService.update(req.params.id, req.body));
  },

  async delete(req: Request, res: Response) {
    await harvestService.delete(req.params.id);
    res.status(204).send();
  },
};
