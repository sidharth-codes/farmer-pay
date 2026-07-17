import type { Request, Response } from 'express';
import { batchService } from '../services/batch.service';

export const batchController = {
  async list(req: Request, res: Response) {
    const search = (req.query.search as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const farmId = (req.query.farmId as string) || undefined;
    const productId = (req.query.productId as string) || undefined;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const result = await batchService.list(search, status, farmId, productId, page, pageSize);
    res.json(result);
  },

  async get(req: Request, res: Response) {
    res.json(await batchService.get(req.params.id));
  },

  async create(req: Request, res: Response) {
    res.status(201).json(await batchService.create(req.body));
  },

  async update(req: Request, res: Response) {
    res.json(await batchService.update(req.params.id, req.body));
  },

  async delete(req: Request, res: Response) {
    await batchService.delete(req.params.id);
    res.status(204).send();
  },

  async addImage(req: Request, res: Response) {
    res.status(201).json(await batchService.addImage(req.params.id, req.body));
  },

  async addCertification(req: Request, res: Response) {
    res.status(201).json(await batchService.addCertification(req.params.id, req.body));
  },
};
