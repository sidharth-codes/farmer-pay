import { Router } from 'express';
import { productController, categoryController } from '../controllers/product.controller';
import { validateBody } from '../middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../models/product.schema';

export const productRouter = Router();
export const categoryRouter = Router();

productRouter.get('/', productController.list);
productRouter.get('/:id', productController.get);
productRouter.post('/', validateBody(createProductSchema), productController.create);
productRouter.put('/:id', validateBody(updateProductSchema), productController.update);
productRouter.delete('/:id', productController.delete);

categoryRouter.get('/', categoryController.list);
categoryRouter.get('/:id', categoryController.get);
categoryRouter.post('/', validateBody(createCategorySchema), categoryController.create);
categoryRouter.put('/:id', validateBody(updateCategorySchema), categoryController.update);
categoryRouter.delete('/:id', categoryController.delete);
