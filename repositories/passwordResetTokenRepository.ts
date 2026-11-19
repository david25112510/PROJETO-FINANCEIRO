import { prisma } from "@/lib/prisma";

export const passwordResetTokenRepository = {
  async deleteForUser(userId: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
  },

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await prisma.passwordResetToken.create({ data });
  },

  async deleteByHash(tokenHash: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
  },

  async findValid(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
    });
  },

  async resetPassword(tokenHash: string, passwordHash: string): Promise<string | null> {
    return prisma.$transaction(async (tx) => {
      const now = new Date();
      const token = await tx.passwordResetToken.findFirst({
        where: { tokenHash, expiresAt: { gt: now } },
      });
      if (!token) return null;

      const consumed = await tx.passwordResetToken.deleteMany({
        where: { id: token.id, tokenHash, expiresAt: { gt: now } },
      });
      if (consumed.count !== 1) return null;

      await tx.passwordResetToken.deleteMany({ where: { userId: token.userId } });
      await tx.user.update({
        where: { id: token.userId },
        data: { passwordHash, falhasLoginConsecutivas: 0, bloqueadoAte: null },
      });
      await tx.session.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt: now },
      });

      return token.userId;
    });
  },
};
