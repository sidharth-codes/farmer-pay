import { z } from 'zod';

export const createFarmSchema = z.object({
  name: z.string().min(2, 'Farm name must be at least 2 characters'),
  address: z.string().min(5, 'Address is required'),
  district: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  farmSize: z.number().positive().optional(),
  farmSizeUnit: z.enum(['acres', 'hectares', 'sq_meters', 'sq_feet']).default('acres'),
  isOrganic: z.boolean().default(false),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).default('PENDING'),
  description: z.string().optional(),
});

export const updateFarmSchema = createFarmSchema.partial();

export type CreateFarmInput = z.infer<typeof createFarmSchema>;
export type UpdateFarmInput = z.infer<typeof updateFarmSchema>;
