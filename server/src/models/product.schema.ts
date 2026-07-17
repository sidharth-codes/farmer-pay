import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  scientificName: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  shelfLife: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
