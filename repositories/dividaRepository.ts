import { prisma } from "@/lib/prisma";
import type { Divida, StatusDivida } from "@prisma/client";

export type CreateDividaInput = {
  userId: string;
  descricao: string;
  credor?: string | null;
  valorOriginal: number;
  valorAtual: number;
  taxaJurosMensal: number;
  parcelasRestantes?: number | null;
  valorParcela?: number | null;
  dataContratacao: Date;
  observacoes?: string | null;
};

export type UpdateDividaInput = Partial<Omit<CreateDividaInput, "userId">> & {
  status?: StatusDivida;
  dataQuitacao?: Date | null;
};

export const dividaRepository = {
  async findAllForUser(userId: string): Promise<Divida[]> {
    return prisma.divida.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },

  async findById(id: string, userId: string): Promise<Divida | null> {
    return prisma.divida.findFirst({ where: { id, userId } });
  },

  async create(data: CreateDividaInput): Promise<Divida> {
    return prisma.divida.create({ data });
  },

  async update(id: string, userId: string, data: UpdateDividaInput): Promise<Divida> {
    const existente = await prisma.divida.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existente) {
      throw new Error("Dívida não encontrada para este usuário.");
    }
    return prisma.divida.update({ where: { id: existente.id }, data });
  },

  async delete(id: string, userId: string): Promise<void> {
    const existente = await prisma.divida.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existente) return;
    await prisma.divida.delete({ where: { id: existente.id } });
  },
};
