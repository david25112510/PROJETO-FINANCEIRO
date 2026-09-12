import { prisma } from "@/lib/prisma";
import type { Categoria, TipoCategoria } from "@prisma/client";

export type CreateCategoriaInput = {
  userId: string;
  nome: string;
  tipo: TipoCategoria;
  cor?: string;
};

export type UpdateCategoriaInput = Partial<Pick<CreateCategoriaInput, "nome" | "cor">>;

export const categoriaRepository = {
  async findAllForUser(userId: string, tipo?: TipoCategoria): Promise<Categoria[]> {
    return prisma.categoria.findMany({
      where: { userId, tipo },
      orderBy: { nome: "asc" },
    });
  },

  async findById(id: string, userId: string): Promise<Categoria | null> {
    return prisma.categoria.findFirst({ where: { id, userId } });
  },

  async findByNome(userId: string, tipo: TipoCategoria, nome: string): Promise<Categoria | null> {
    return prisma.categoria.findUnique({
      where: { userId_tipo_nome: { userId, tipo, nome } },
    });
  },

  async create(data: CreateCategoriaInput): Promise<Categoria> {
    return prisma.categoria.create({ data });
  },

  async update(id: string, userId: string, data: UpdateCategoriaInput): Promise<Categoria> {
    const existente = await prisma.categoria.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existente) {
      throw new Error("Categoria não encontrada para este usuário.");
    }
    return prisma.categoria.update({ where: { id: existente.id }, data });
  },

  async delete(id: string, userId: string): Promise<void> {
    const existente = await prisma.categoria.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existente) return;
    await prisma.categoria.delete({ where: { id: existente.id } });
  },
};
