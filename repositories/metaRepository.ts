import { prisma } from "@/lib/prisma";
import type { Meta, StatusMeta } from "@prisma/client";

export type CreateMetaInput = {
  userId: string;
  nome: string;
  descricao?: string | null;
  valorAlvo: number;
  valorAtual?: number;
  dataAlvo: Date;
  categoriaId?: string | null;
};

export type UpdateMetaInput = Partial<Omit<CreateMetaInput, "userId">> & {
  status?: StatusMeta;
  dataConclusao?: Date | null;
};

export const metaRepository = {
  async findAllForUser(userId: string): Promise<Meta[]> {
    return prisma.meta.findMany({
      where: { userId },
      include: { categoria: true },
      orderBy: { dataAlvo: "asc" },
    });
  },

  async findById(id: string, userId: string) {
    return prisma.meta.findFirst({ where: { id, userId }, include: { categoria: true } });
  },

  async create(data: CreateMetaInput): Promise<Meta> {
    return prisma.meta.create({ data });
  },

  async update(id: string, userId: string, data: UpdateMetaInput): Promise<Meta> {
    const existente = await prisma.meta.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existente) {
      throw new Error("Meta não encontrada para este usuário.");
    }
    return prisma.meta.update({ where: { id: existente.id }, data });
  },

  async delete(id: string, userId: string): Promise<void> {
    const existente = await prisma.meta.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existente) return;
    await prisma.meta.delete({ where: { id: existente.id } });
  },
};
