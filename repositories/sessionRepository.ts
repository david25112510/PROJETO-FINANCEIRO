import { prisma } from "@/lib/prisma";
import type { Session } from "@prisma/client";

export type CreateSessionInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
};

/**
 * Único ponto de acesso ao Prisma para a entidade Session.
 */
export const sessionRepository = {
  async create(data: CreateSessionInput): Promise<Session> {
    return prisma.session.create({ data });
  },

  async findActiveByTokenHash(tokenHash: string): Promise<Session | null> {
    return prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  },

  async findActiveByTokenHashWithUser(tokenHash: string) {
    return prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  },

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async revokeAllForUserExceto(userId: string, tokenHashAtual: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId, revokedAt: null, tokenHash: { not: tokenHashAtual } },
      data: { revokedAt: new Date() },
    });
  },

  async findAtivasParaUsuario(userId: string): Promise<Session[]> {
    return prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
  },

  async revokeById(id: string, userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { id, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async deleteExpired(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  },
};
