import { z } from 'zod';

export const createBatchSchema = z.object({
  harvestId: z.string().uuid('Valid harvest ID is required'),
  productId: z.string().uuid('Valid product ID is required'),
  farmId: z.string().uuid('Valid farm ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.enum(['kg', 'quintal', 'ton', 'crate', 'box', 'bag', 'liter']).default('kg'),
});

export const updateBatchSchema = z.object({
  quantity: z.number().positive().optional(),
  unit: z.enum(['kg', 'quintal', 'ton', 'crate', 'box', 'bag', 'liter']).optional(),
  status: z
    .enum(['CREATED', 'LISTED', 'RESERVED', 'PURCHASED', 'TRANSFERRED', 'DELIVERED', 'CLOSED'])
    .optional(),
  currentHolderId: z.string().uuid().optional().nullable(),
});

export const addBatchImageSchema = z.object({
  url: z.string().url('Valid image URL is required'),
  caption: z.string().optional(),
});

export const addCertificationSchema = z.object({
  name: z.string().min(2, 'Certification name is required'),
  issuedBy: z.string().min(2, 'Issuer is required'),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date().optional(),
  documentUrl: z.string().url().optional().or(z.literal('')),
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
export type AddBatchImageInput = z.infer<typeof addBatchImageSchema>;
export type AddCertificationInput = z.infer<typeof addCertificationSchema>;
