import { prisma } from "@/lib/prisma";
import type { Despesa } from "@prisma/client";
import type {
  CreateLancamentoInput,
  LancamentoFiltro,
  Paginacao,
  PaginaResultado,
  TotalPorCategoria,
  UpdateLancamentoInput,
} from "@/repositories/types";

function buildWhere(userId: string, filtro?: LancamentoFiltro) {
  return {
    userId,
    ...(filtro?.dataInicio || filtro?.dataFim
      ? {
          data: {
            ...(filtro.dataInicio ? { gte: filtro.dataInicio } : {}),
            ...(filtro.dataFim ? { lte: filtro.dataFim } : {}),
          },
        }
      : {}),
    ...(filtro?.categoriaId ? { categoriaId: filtro.categoriaId } : {}),
    ...(filtro?.busca ? { descricao: { contains: filtro.busca, mode: "insensitive" as const } } : {}),
  };
}

export const despesaRepository = {
  async findManyPaginated(
    userId: string,
    filtro: LancamentoFiltro,
    paginacao: Paginacao,
  ): Promise<PaginaResultado<Despesa>> {
    const where = buildWhere(userId, filtro);
    const [itens, total] = await Promise.all([
      prisma.despesa.findMany({
        where,
        include: { categoria: true },
        orderBy: { data: "desc" },
        skip: (paginacao.page - 1) * paginacao.pageSize,
        take: paginacao.pageSize,
      }),
      prisma.despesa.count({ where }),
    ]);
    return { itens, total, page: paginacao.page, pageSize: paginacao.pageSize };
  },

  async findById(id: string, userId: string) {
    return prisma.despesa.findFirst({ where: { id, userId }, include: { categoria: true } });
  },

  async create(data: CreateLancamentoInput): Promise<Despesa> {
    return prisma.despesa.create({ data });
  },

  async createMany(data: CreateLancamentoInput[]): Promise<Despesa[]> {
    return prisma.$transaction(data.map((item) => prisma.despesa.create({ data: item })));
  },

  async update(id: string, userId: string, data: UpdateLancamentoInput): Promise<Despesa> {
    const existente = await prisma.despesa.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existente) {
      throw new Error("Despesa não encontrada para este usuário.");
    }
    return prisma.despesa.update({ where: { id: existente.id }, data });
  },

  async delete(id: string, userId: string): Promise<void> {
    const existente = await prisma.despesa.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existente) return;
    await prisma.despesa.delete({ where: { id: existente.id } });
  },

  async deleteFuturasByGrupo(grupoRecorrenciaId: string, userId: string, aPartirDe: Date): Promise<number> {
    const result = await prisma.despesa.deleteMany({
      where: { grupoRecorrenciaId, userId, data: { gte: aPartirDe } },
    });
    return result.count;
  },

  async somaPorPeriodo(userId: string, dataInicio: Date, dataFim: Date, categoriaId?: string): Promise<number> {
    const result = await prisma.despesa.aggregate({
      where: { userId, data: { gte: dataInicio, lte: dataFim }, ...(categoriaId ? { categoriaId } : {}) },
      _sum: { valor: true },
    });
    return Number(result._sum.valor ?? 0);
  },

  async somaPorCategoria(userId: string, dataInicio: Date, dataFim: Date): Promise<TotalPorCategoria[]> {
    const resultado = await prisma.despesa.groupBy({
      by: ["categoriaId"],
      where: { userId, data: { gte: dataInicio, lte: dataFim } },
      _sum: { valor: true },
    });
    return resultado.map((r) => ({ categoriaId: r.categoriaId, total: Number(r._sum.valor ?? 0) }));
  },

  /** Categorias mais usadas no histórico para descrições semelhantes — base da categorização automática. */
  async contarCategoriasPorDescricaoSimilar(
    userId: string,
    termo: string,
  ): Promise<{ categoriaId: string; contagem: number }[]> {
    const resultado = await prisma.despesa.groupBy({
      by: ["categoriaId"],
      where: { userId, categoriaId: { not: null }, descricao: { contains: termo, mode: "insensitive" } },
      _count: { categoriaId: true },
      orderBy: { _count: { categoriaId: "desc" } },
      take: 5,
    });
    return resultado
      .filter((r): r is typeof r & { categoriaId: string } => r.categoriaId !== null)
      .map((r) => ({ categoriaId: r.categoriaId, contagem: r._count.categoriaId }));
  },

  /** Conjunto mínimo de campos usado para deduplicar importações de extrato. */
  async listarParaDeduplicacao(userId: string, dataInicio: Date, dataFim: Date) {
    const registros = await prisma.despesa.findMany({
      where: { userId, data: { gte: dataInicio, lte: dataFim } },
      select: { data: true, valor: true, descricao: true },
    });
    return registros.map((r) => ({ data: r.data, valor: Number(r.valor), descricao: r.descricao }));
  },
};
