import { farmRepository } from '../repositories/farm.repository';
import { ApiError } from '../utils/errors';
import type { CreateFarmInput, UpdateFarmInput } from '../models/farm.schema';

export const farmService = {
  list: (search?: string, page = 1, pageSize = 20) => {
    const skip = (page - 1) * pageSize;
    return Promise.all([
      farmRepository.findMany({ search, skip, take: pageSize }),
      farmRepository.count(search),
    ]).then(([items, total]) => ({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    }));
  },

  get: (id: string) => {
    return farmRepository.findById(id).then((farm) => {
      if (!farm) throw new ApiError(404, 'FARM_NOT_FOUND', 'Farm not found');
      return farm;
    });
  },

  create: (input: CreateFarmInput) => farmRepository.create(input),

  update: (id: string, input: UpdateFarmInput) => {
    return farmRepository.findById(id).then((farm) => {
      if (!farm) throw new ApiError(404, 'FARM_NOT_FOUND', 'Farm not found');
      return farmRepository.update(id, input);
    });
  },

  delete: (id: string) => {
    return farmRepository.findById(id).then((farm) => {
      if (!farm) throw new ApiError(404, 'FARM_NOT_FOUND', 'Farm not found');
      return farmRepository.delete(id);
    });
  },
};
