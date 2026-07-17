import { prisma } from '../config/prisma';

// Repository layer isolates Prisma access so services stay testable.
export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  create: (data: { name: string; email: string; password: string; role: string; phone?: string }) =>
    prisma.user.create({ data }),
};
