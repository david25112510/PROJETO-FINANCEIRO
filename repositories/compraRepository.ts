import { prisma } from "@/lib/prisma";
import type { Compra } from "@prisma/client";
import type { TotalPorCategoria } from "@/repositories/types";

export type CreateCompraInput = {
  userId: string;
  cartaoId: string;
  faturaId: string;
  categoriaId?: string | null;
  descricao: string;
  valor: number;
  data: Date;
  parcelaAtual?: number | null;
  totalParcelas?: number | null;
  grupoParcelamentoId?: string | null;
  observacoes?: string | null;
};

export const compraRepository = {
  async create(data: CreateCompraInput): Promise<Compra> {
    return prisma.compra.create({ data });
  },

  async createMany(data: CreateCompraInput[]): Promise<Compra[]> {
    return prisma.$transaction(data.map((item) => prisma.compra.create({ data: item })));
  },

  async findById(id: string, userId: string) {
    return prisma.compra.findFirst({ where: { id, userId }, include: { categoria: true } });
  },

  async delete(id: string, userId: string): Promise<void> {
    const existente = await prisma.compra.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existente) return;
    await prisma.compra.delete({ where: { id: existente.id } });
  },

  async somaPorPeriodo(userId: string, dataInicio: Date, dataFim: Date, categoriaId?: string): Promise<number> {
    const result = await prisma.compra.aggregate({
      where: { userId, data: { gte: dataInicio, lte: dataFim }, ...(categoriaId ? { categoriaId } : {}) },
      _sum: { valor: true },
    });
    return Number(result._sum.valor ?? 0);
  },

  async somaPorCategoria(userId: string, dataInicio: Date, dataFim: Date): Promise<TotalPorCategoria[]> {
    const resultado = await prisma.compra.groupBy({
      by: ["categoriaId"],
      where: { userId, data: { gte: dataInicio, lte: dataFim } },
      _sum: { valor: true },
    });
    return resultado.map((r) => ({ categoriaId: r.categoriaId, total: Number(r._sum.valor ?? 0) }));
  },
};
