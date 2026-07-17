import { batchRepository } from '../repositories/batch.repository';
import { harvestRepository } from '../repositories/harvest.repository';
import { productRepository } from '../repositories/product.repository';
import { farmRepository } from '../repositories/farm.repository';
import { ApiError } from '../utils/errors';
import type {
  CreateBatchInput,
  UpdateBatchInput,
  AddBatchImageInput,
  AddCertificationInput,
} from '../models/batch.schema';

export const batchService = {
  list: (
    search?: string,
    status?: string,
    farmId?: string,
    productId?: string,
    page = 1,
    pageSize = 20,
  ) => {
    const skip = (page - 1) * pageSize;
    return Promise.all([
      batchRepository.findMany({ search, status, farmId, productId, skip, take: pageSize }),
      batchRepository.count(search, status, farmId, productId),
    ]).then(([items, total]) => ({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    }));
  },

  get: (id: string) =>
    batchRepository.findById(id).then((b) => {
      if (!b) throw new ApiError(404, 'BATCH_NOT_FOUND', 'Batch not found');
      return b;
    }),

  getByBatchId: (batchId: string) =>
    batchRepository.findByBatchId(batchId).then((b) => {
      if (!b) throw new ApiError(404, 'BATCH_NOT_FOUND', 'Batch not found');
      return b;
    }),

  create: (input: CreateBatchInput) =>
    Promise.all([
      harvestRepository.findById(input.harvestId),
      productRepository.findById(input.productId),
      farmRepository.findById(input.farmId),
    ]).then(([harvest, product, farm]) => {
      if (!harvest) throw new ApiError(404, 'HARVEST_NOT_FOUND', 'Harvest not found');
      if (!product) throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
      if (!farm) throw new ApiError(404, 'FARM_NOT_FOUND', 'Farm not found');
      return batchRepository.create(input);
    }),

  update: (id: string, input: UpdateBatchInput) =>
    batchRepository.findById(id).then((b) => {
      if (!b) throw new ApiError(404, 'BATCH_NOT_FOUND', 'Batch not found');
      return batchRepository.update(id, input);
    }),

  delete: (id: string) =>
    batchRepository.findById(id).then((b) => {
      if (!b) throw new ApiError(404, 'BATCH_NOT_FOUND', 'Batch not found');
      return batchRepository.delete(id);
    }),

  addImage: (batchId: string, input: AddBatchImageInput) =>
    batchRepository.findById(batchId).then((b) => {
      if (!b) throw new ApiError(404, 'BATCH_NOT_FOUND', 'Batch not found');
      return batchRepository.addImage(batchId, input.url, input.caption);
    }),

  addCertification: (batchId: string, input: AddCertificationInput) =>
    batchRepository.findById(batchId).then((b) => {
      if (!b) throw new ApiError(404, 'BATCH_NOT_FOUND', 'Batch not found');
      return batchRepository.addCertification({
        batchId,
        name: input.name,
        issuedBy: input.issuedBy,
        issueDate: input.issueDate,
        expiryDate: input.expiryDate,
        documentUrl: input.documentUrl,
      });
    }),
};
