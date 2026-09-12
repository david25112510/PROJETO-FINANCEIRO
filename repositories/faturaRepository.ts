import { prisma } from "@/lib/prisma";
import type { Fatura, StatusFatura } from "@prisma/client";

export type CreateFaturaInput = {
  cartaoId: string;
  mesReferencia: number;
  anoReferencia: number;
  dataFechamento: Date;
  dataVencimento: Date;
};

export const faturaRepository = {
  async findByCartaoECiclo(
    cartaoId: string,
    mesReferencia: number,
    anoReferencia: number,
  ): Promise<Fatura | null> {
    return prisma.fatura.findUnique({
      where: { cartaoId_mesReferencia_anoReferencia: { cartaoId, mesReferencia, anoReferencia } },
    });
  },

  async create(data: CreateFaturaInput): Promise<Fatura> {
    return prisma.fatura.create({ data });
  },

  async findAllForCartao(cartaoId: string): Promise<Fatura[]> {
    return prisma.fatura.findMany({
      where: { cartaoId },
      orderBy: [{ anoReferencia: "desc" }, { mesReferencia: "desc" }],
    });
  },

  async findByIdComCompras(id: string) {
    return prisma.fatura.findUnique({
      where: { id },
      include: { compras: { include: { categoria: true }, orderBy: { data: "desc" } }, cartao: true },
    });
  },

  async listarAbertasVencidas(hoje: Date): Promise<Fatura[]> {
    return prisma.fatura.findMany({ where: { status: "ABERTA", dataFechamento: { lte: hoje } } });
  },

  async fecharComTotal(id: string, valorTotal: number): Promise<Fatura> {
    return prisma.fatura.update({ where: { id }, data: { status: "FECHADA", valorTotal } });
  },

  async registrarPagamento(id: string, novoValorPago: number, novoStatus: StatusFatura): Promise<Fatura> {
    return prisma.fatura.update({ where: { id }, data: { valorPago: novoValorPago, status: novoStatus } });
  },

  async somaCompras(faturaId: string): Promise<number> {
    const result = await prisma.compra.aggregate({ where: { faturaId }, _sum: { valor: true } });
    return Number(result._sum.valor ?? 0);
  },

  async calcularSaldoDevedor(cartaoId: string): Promise<number> {
    const [abertas, fechadas] = await Promise.all([
      prisma.compra.aggregate({ where: { cartaoId, fatura: { status: "ABERTA" } }, _sum: { valor: true } }),
      prisma.fatura.aggregate({
        where: { cartaoId, status: { in: ["FECHADA", "PAGA_PARCIAL"] } },
        _sum: { valorTotal: true, valorPago: true },
      }),
    ]);

    const emAberto = Number(abertas._sum.valor ?? 0);
    const naoQuitado = Number(fechadas._sum.valorTotal ?? 0) - Number(fechadas._sum.valorPago ?? 0);
    return emAberto + naoQuitado;
  },
};
