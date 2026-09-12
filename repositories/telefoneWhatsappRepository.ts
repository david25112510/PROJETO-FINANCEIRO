import { prisma } from "@/lib/prisma";
import type { TelefoneWhatsapp } from "@prisma/client";

export const telefoneWhatsappRepository = {
  async buscarPorUsuario(userId: string): Promise<TelefoneWhatsapp | null> {
    return prisma.telefoneWhatsapp.findUnique({ where: { userId } });
  },

  async buscarPorNumero(numero: string): Promise<TelefoneWhatsapp | null> {
    return prisma.telefoneWhatsapp.findUnique({ where: { numero } });
  },

  async iniciarVinculo(
    userId: string,
    numero: string,
    codigoVerificacao: string,
    codigoExpiraEm: Date,
  ): Promise<TelefoneWhatsapp> {
    return prisma.telefoneWhatsapp.upsert({
      where: { userId },
      create: { userId, numero, codigoVerificacao, codigoExpiraEm, verificado: false },
      update: { numero, codigoVerificacao, codigoExpiraEm, verificado: false },
    });
  },

  async confirmarVinculo(id: string): Promise<TelefoneWhatsapp> {
    return prisma.telefoneWhatsapp.update({
      where: { id },
      data: { verificado: true, codigoVerificacao: null, codigoExpiraEm: null },
    });
  },

  async remover(userId: string): Promise<void> {
    await prisma.telefoneWhatsapp.deleteMany({ where: { userId } });
  },
};
