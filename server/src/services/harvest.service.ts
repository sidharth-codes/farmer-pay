import { harvestRepository } from '../repositories/harvest.repository';
import { farmRepository } from '../repositories/farm.repository';
import { ApiError } from '../utils/errors';
import type { CreateHarvestInput, UpdateHarvestInput } from '../models/harvest.schema';

export const harvestService = {
  list: (search?: string, farmId?: string, page = 1, pageSize = 20) => {
    const skip = (page - 1) * pageSize;
    return Promise.all([
      harvestRepository.findMany({ search, farmId, skip, take: pageSize }),
      harvestRepository.count(farmId),
    ]).then(([items, total]) => ({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    }));
  },

  get: (id: string) =>
    harvestRepository.findById(id).then((h) => {
      if (!h) throw new ApiError(404, 'HARVEST_NOT_FOUND', 'Harvest not found');
      return h;
    }),

  create: (input: CreateHarvestInput) =>
    farmRepository.findById(input.farmId).then((farm) => {
      if (!farm) throw new ApiError(404, 'FARM_NOT_FOUND', 'Farm not found');
      return harvestRepository.create(input);
    }),

  update: (id: string, input: UpdateHarvestInput) =>
    harvestRepository.findById(id).then((h) => {
      if (!h) throw new ApiError(404, 'HARVEST_NOT_FOUND', 'Harvest not found');
      return harvestRepository.update(id, input);
    }),

  delete: (id: string) =>
    harvestRepository.findById(id).then((h) => {
      if (!h) throw new ApiError(404, 'HARVEST_NOT_FOUND', 'Harvest not found');
      return harvestRepository.delete(id);
    }),
};
