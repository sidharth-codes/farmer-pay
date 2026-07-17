import { productRepository, categoryRepository } from '../repositories/product.repository';
import { ApiError } from '../utils/errors';
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../models/product.schema';

export const productService = {
  list: (search?: string, categoryId?: string, page = 1, pageSize = 20) => {
    const skip = (page - 1) * pageSize;
    return Promise.all([
      productRepository.findMany({ search, categoryId, skip, take: pageSize }),
      productRepository.count(search, categoryId),
    ]).then(([items, total]) => ({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    }));
  },

  get: (id: string) =>
    productRepository.findById(id).then((p) => {
      if (!p) throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
      return p;
    }),

  create: (input: CreateProductInput) => productRepository.create(input),

  update: (id: string, input: UpdateProductInput) =>
    productRepository.findById(id).then((p) => {
      if (!p) throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
      return productRepository.update(id, input);
    }),

  delete: (id: string) =>
    productRepository.findById(id).then((p) => {
      if (!p) throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
      return productRepository.delete(id);
    }),
};

export const categoryService = {
  list: () => categoryRepository.findMany(),

  get: (id: string) =>
    categoryRepository.findById(id).then((c) => {
      if (!c) throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
      return c;
    }),

  create: (input: CreateCategoryInput) =>
    categoryRepository.findByName(input.name).then((existing) => {
      if (existing) throw new ApiError(409, 'CATEGORY_EXISTS', 'Category already exists');
      return categoryRepository.create(input);
    }),

  update: (id: string, input: UpdateCategoryInput) =>
    categoryRepository.findById(id).then((c) => {
      if (!c) throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
      return categoryRepository.update(id, input);
    }),

  delete: (id: string) =>
    categoryRepository.findById(id).then((c) => {
      if (!c) throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
      return categoryRepository.delete(id);
    }),
};
