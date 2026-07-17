import { prisma } from '../config/prisma';

export const harvestRepository = {
  findMany: (params?: { search?: string; farmId?: string; skip?: number; take?: number }) => {
    const where: Record<string, unknown> = {};
    if (params?.farmId) where.farmId = params.farmId;
    if (params?.search) {
      where.OR = [
        { season: { contains: params.search, mode: 'insensitive' } },
        { notes: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    return prisma.harvest.findMany({
      where,
      include: { farm: true, batches: true },
      skip: params?.skip,
      take: params?.take,
      orderBy: { harvestDate: 'desc' },
    });
  },

  count: (farmId?: string) =>
    prisma.harvest.count({ where: farmId ? { farmId } : undefined }),

  findById: (id: string) =>
    prisma.harvest.findUnique({
      where: { id },
      include: { farm: true, batches: { include: { product: true } } },
    }),

  create: (data: {
    farmId: string;
    harvestDate: Date;
    weatherNotes?: string;
    season?: string;
    notes?: string;
    createdBy?: string;
  }) =>
    prisma.harvest.create({ data, include: { farm: true } }),

  update: (id: string, data: Record<string, unknown>) =>
    prisma.harvest.update({ where: { id }, data, include: { farm: true } }),

  delete: (id: string) => prisma.harvest.delete({ where: { id } }),
};
