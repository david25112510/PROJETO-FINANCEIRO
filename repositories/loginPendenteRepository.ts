import { prisma } from "@/lib/prisma";
import type { LoginPendente } from "@prisma/client";

export type CreateLoginPendenteInput = {
  userId: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export const loginPendenteRepository = {
  async create(data: CreateLoginPendenteInput): Promise<LoginPendente> {
    return prisma.loginPendente.create({ data });
  },

  async findValidoComUsuario(id: string) {
    return prisma.loginPendente.findFirst({
      where: { id, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.loginPendente.deleteMany({ where: { id } });
  },

  async deleteExpirados(): Promise<void> {
    await prisma.loginPendente.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  },
};
