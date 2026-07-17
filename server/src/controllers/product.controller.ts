import type { Request, Response } from 'express';
import { productService, categoryService } from '../services/product.service';

export const productController = {
  async list(req: Request, res: Response) {
    const search = (req.query.search as string) || undefined;
    const categoryId = (req.query.categoryId as string) || undefined;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const result = await productService.list(search, categoryId, page, pageSize);
    res.json(result);
  },

  async get(req: Request, res: Response) {
    res.json(await productService.get(req.params.id));
  },

  async create(req: Request, res: Response) {
    res.status(201).json(await productService.create(req.body));
  },

  async update(req: Request, res: Response) {
    res.json(await productService.update(req.params.id, req.body));
  },

  async delete(req: Request, res: Response) {
    await productService.delete(req.params.id);
    res.status(204).send();
  },
};

export const categoryController = {
  async list(_req: Request, res: Response) {
    res.json(await categoryService.list());
  },

  async get(req: Request, res: Response) {
    res.json(await categoryService.get(req.params.id));
  },

  async create(req: Request, res: Response) {
    res.status(201).json(await categoryService.create(req.body));
  },

  async update(req: Request, res: Response) {
    res.json(await categoryService.update(req.params.id, req.body));
  },

  async delete(req: Request, res: Response) {
    await categoryService.delete(req.params.id);
    res.status(204).send();
  },
};
