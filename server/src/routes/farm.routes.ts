import { Router } from 'express';
import { farmController } from '../controllers/farm.controller';
import { validateBody } from '../middleware/validate';
import { createFarmSchema, updateFarmSchema } from '../models/farm.schema';

export const farmRouter = Router();

farmRouter.get('/', farmController.list);
farmRouter.get('/:id', farmController.get);
farmRouter.post('/', validateBody(createFarmSchema), farmController.create);
farmRouter.put('/:id', validateBody(updateFarmSchema), farmController.update);
farmRouter.delete('/:id', farmController.delete);
