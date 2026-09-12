import { prisma } from "@/lib/prisma";
import type { ConsentimentoOpenFinance } from "@prisma/client";

export const consentimentoOpenFinanceRepository = {
  async buscarPorUsuario(userId: string): Promise<ConsentimentoOpenFinance | null> {
    return prisma.consentimentoOpenFinance.findUnique({ where: { userId } });
  },

  async conceder(userId: string): Promise<ConsentimentoOpenFinance> {
    const agora = new Date();
    return prisma.consentimentoOpenFinance.upsert({
      where: { userId },
      create: { userId, consentido: true, consentidoEm: agora },
      update: { consentido: true, consentidoEm: agora, revogadoEm: null },
    });
  },

  async revogar(userId: string): Promise<ConsentimentoOpenFinance> {
    return prisma.consentimentoOpenFinance.upsert({
      where: { userId },
      create: { userId, consentido: false, revogadoEm: new Date() },
      update: { consentido: false, revogadoEm: new Date() },
    });
  },
};
