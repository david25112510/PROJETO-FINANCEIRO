import { prisma } from "@/lib/prisma";
import type { DirecaoMensagemWhatsapp, MensagemWhatsapp } from "@prisma/client";

export type CreateMensagemWhatsappInput = {
  userId?: string | null;
  numero: string;
  direcao: DirecaoMensagemWhatsapp;
  conteudo: string;
  intencao?: string | null;
  processadoComSucesso?: boolean;
  entidadeCriadaTipo?: string | null;
  entidadeCriadaId?: string | null;
};

export const mensagemWhatsappRepository = {
  async create(data: CreateMensagemWhatsappInput): Promise<MensagemWhatsapp> {
    return prisma.mensagemWhatsapp.create({ data });
  },

  async listarPorUsuario(userId: string, limite = 50): Promise<MensagemWhatsapp[]> {
    return prisma.mensagemWhatsapp.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limite,
    });
  },
};
