import { Router } from 'express';
import { harvestController } from '../controllers/harvest.controller';
import { validateBody } from '../middleware/validate';
import { createHarvestSchema, updateHarvestSchema } from '../models/harvest.schema';

export const harvestRouter = Router();

harvestRouter.get('/', harvestController.list);
harvestRouter.get('/:id', harvestController.get);
harvestRouter.post('/', validateBody(createHarvestSchema), harvestController.create);
harvestRouter.put('/:id', validateBody(updateHarvestSchema), harvestController.update);
harvestRouter.delete('/:id', harvestController.delete);
