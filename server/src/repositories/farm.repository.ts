import { prisma } from '../config/prisma';

export const farmRepository = {
  findMany: (params?: { search?: string; skip?: number; take?: number }) => {
    const where = params?.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' as const } },
            { district: { contains: params.search, mode: 'insensitive' as const } },
            { state: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;
    return prisma.farm.findMany({
      where,
      include: { location: true },
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
    });
  },

  count: (search?: string) =>
    prisma.farm.count({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { district: { contains: search, mode: 'insensitive' } },
              { state: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
    }),

  findById: (id: string) =>
    prisma.farm.findUnique({
      where: { id },
      include: { location: true, harvests: { include: { batches: true } } },
    }),

  create: (data: {
    name: string;
    address?: string;
    district?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    farmSize?: number;
    farmSizeUnit?: string;
    isOrganic?: boolean;
    verificationStatus?: string;
    description?: string;
  }) => prisma.farm.create({ data, include: { location: true } }),

  update: (id: string, data: Record<string, unknown>) =>
    prisma.farm.update({ where: { id }, data, include: { location: true } }),

  delete: (id: string) => prisma.farm.delete({ where: { id } }),
};
