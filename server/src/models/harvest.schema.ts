import { z } from 'zod';

export const createHarvestSchema = z.object({
  farmId: z.string().uuid('Valid farm ID is required'),
  harvestDate: z.coerce.date(),
  weatherNotes: z.string().optional(),
  season: z.string().optional(),
  notes: z.string().optional(),
});

export const updateHarvestSchema = createHarvestSchema.partial();

export type CreateHarvestInput = z.infer<typeof createHarvestSchema>;
export type UpdateHarvestInput = z.infer<typeof updateHarvestSchema>;
