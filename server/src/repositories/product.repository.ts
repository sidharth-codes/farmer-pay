import { prisma } from '../config/prisma';

export const productRepository = {
  findMany: (params?: { search?: string; categoryId?: string; skip?: number; take?: number }) => {
    const where: Record<string, unknown> = {};
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { scientificName: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params?.categoryId) where.categoryId = params.categoryId;
    return prisma.product.findMany({
      where,
      include: { category: true },
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
    });
  },

  count: (search?: string, categoryId?: string) => {
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { scientificName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    return prisma.product.count({ where });
  },

  findById: (id: string) =>
    prisma.product.findUnique({ where: { id }, include: { category: true } }),

  create: (data: {
    name: string;
    scientificName?: string;
    description?: string;
    categoryId?: string;
    shelfLife?: string;
    imageUrl?: string;
  }) => prisma.product.create({ data, include: { category: true } }),

  update: (id: string, data: Record<string, unknown>) =>
    prisma.product.update({ where: { id }, data, include: { category: true } }),

  delete: (id: string) => prisma.product.delete({ where: { id } }),
};

export const categoryRepository = {
  findMany: () =>
    prisma.productCategory.findMany({ orderBy: { name: 'asc' } }),

  findById: (id: string) => prisma.productCategory.findUnique({ where: { id } }),

  findByName: (name: string) =>
    prisma.productCategory.findUnique({ where: { name } }),

  create: (data: { name: string; description?: string }) =>
    prisma.productCategory.create({ data }),

  update: (id: string, data: { name?: string; description?: string }) =>
    prisma.productCategory.update({ where: { id }, data }),

  delete: (id: string) => prisma.productCategory.delete({ where: { id } }),
};
