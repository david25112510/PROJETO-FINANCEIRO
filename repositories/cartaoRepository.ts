import { prisma } from "@/lib/prisma";
import type { Cartao } from "@prisma/client";

export type CreateCartaoInput = {
  userId: string;
  nome: string;
  bandeira?: string | null;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
  cor?: string;
};

export type UpdateCartaoInput = Partial<Omit<CreateCartaoInput, "userId">> & { ativo?: boolean };

export const cartaoRepository = {
  async findAllForUser(userId: string): Promise<Cartao[]> {
    return prisma.cartao.findMany({ where: { userId }, orderBy: { nome: "asc" } });
  },

  async findById(id: string, userId: string): Promise<Cartao | null> {
    return prisma.cartao.findFirst({ where: { id, userId } });
  },

  async create(data: CreateCartaoInput): Promise<Cartao> {
    return prisma.cartao.create({ data });
  },

  async update(id: string, userId: string, data: UpdateCartaoInput): Promise<Cartao> {
    const existente = await prisma.cartao.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existente) {
      throw new Error("Cartão não encontrado para este usuário.");
    }
    return prisma.cartao.update({ where: { id: existente.id }, data });
  },

  async delete(id: string, userId: string): Promise<void> {
    const existente = await prisma.cartao.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existente) return;
    await prisma.cartao.delete({ where: { id: existente.id } });
  },
};
