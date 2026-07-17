import { Router } from 'express';
import { batchController } from '../controllers/batch.controller';
import { validateBody } from '../middleware/validate';
import {
  createBatchSchema,
  updateBatchSchema,
  addBatchImageSchema,
  addCertificationSchema,
} from '../models/batch.schema';

export const batchRouter = Router();

batchRouter.get('/', batchController.list);
batchRouter.get('/:id', batchController.get);
batchRouter.post('/', validateBody(createBatchSchema), batchController.create);
batchRouter.put('/:id', validateBody(updateBatchSchema), batchController.update);
batchRouter.delete('/:id', batchController.delete);

batchRouter.post('/:id/images', validateBody(addBatchImageSchema), batchController.addImage);
batchRouter.post(
  '/:id/certifications',
  validateBody(addCertificationSchema),
  batchController.addCertification,
);
