import { prisma } from '../config/prisma';

// Generates an immutable batch ID: FP-XX-YYYY-NNNNNN
// XX = 2-char region code (defaults to KL), YYYY = year, NNNNNN = zero-padded sequence.
async function generateBatchId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FP-KL-${year}-`;

  // Count existing batches this year to determine the sequence number.
  // Uses a like-query on the prefix for a monotonic counter.
  const count = await prisma.batch.count({
    where: { batchId: { startsWith: prefix } },
  });

  const sequence = String(count + 1).padStart(6, '0');
  return `${prefix}${sequence}`;
}

export const batchRepository = {
  findMany: (params?: {
    search?: string;
    status?: string;
    farmId?: string;
    productId?: string;
    skip?: number;
    take?: number;
  }) => {
    const where: Record<string, unknown> = {};
    if (params?.status) where.status = params.status;
    if (params?.farmId) where.farmId = params.farmId;
    if (params?.productId) where.productId = params.productId;
    if (params?.search) {
      where.OR = [
        { batchId: { contains: params.search, mode: 'insensitive' } },
        { product: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }
    return prisma.batch.findMany({
      where,
      include: {
        farm: true,
        product: { include: { category: true } },
        harvest: true,
        images: true,
        certifications: true,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
    });
  },

  count: (search?: string, status?: string, farmId?: string, productId?: string) => {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (farmId) where.farmId = farmId;
    if (productId) where.productId = productId;
    if (search) {
      where.OR = [
        { batchId: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    return prisma.batch.count({ where });
  },

  findById: (id: string) =>
    prisma.batch.findUnique({
      where: { id },
      include: {
        farm: { include: { location: true } },
        product: { include: { category: true } },
        harvest: { include: { farm: true } },
        images: true,
        certifications: true,
      },
    }),

  findByBatchId: (batchId: string) =>
    prisma.batch.findUnique({
      where: { batchId },
      include: {
        farm: { include: { location: true } },
        product: { include: { category: true } },
        harvest: true,
        images: true,
        certifications: true,
      },
    }),

  create: async (data: {
    harvestId: string;
    productId: string;
    farmId: string;
    quantity: number;
    unit: string;
  }) => {
    const batchId = await generateBatchId();
    return prisma.batch.create({
      data: { ...data, batchId },
      include: {
        farm: true,
        product: { include: { category: true } },
        harvest: true,
        images: true,
        certifications: true,
      },
    });
  },

  update: (id: string, data: Record<string, unknown>) =>
    prisma.batch.update({
      where: { id },
      data,
      include: {
        farm: true,
        product: { include: { category: true } },
        harvest: true,
        images: true,
        certifications: true,
      },
    }),

  delete: (id: string) => prisma.batch.delete({ where: { id } }),

  addImage: (batchId: string, url: string, caption?: string) =>
    prisma.batchImage.create({ data: { batchId, url, caption } }),

  addCertification: (data: {
    batchId: string;
    name: string;
    issuedBy: string;
    issueDate: Date;
    expiryDate?: Date;
    documentUrl?: string;
  }) => prisma.certification.create({ data }),
};
