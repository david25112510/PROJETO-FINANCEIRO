import { prisma } from "@/lib/prisma";
import type { Financiamento, SistemaAmortizacao, StatusFinanciamento } from "@prisma/client";

export type CreateFinanciamentoInput = {
  userId: string;
  descricao: string;
  valorTotal: number;
  taxaJurosMensal: number;
  numeroParcelas: number;
  sistemaAmortizacao: SistemaAmortizacao;
  dataContratacao: Date;
  observacoes?: string | null;
};

export type UpdateFinanciamentoInput = Partial<Omit<CreateFinanciamentoInput, "userId">> & {
  status?: StatusFinanciamento;
};

export const financiamentoRepository = {
  async findAllForUser(userId: string): Promise<Financiamento[]> {
    return prisma.financiamento.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },

  async findById(id: string, userId: string): Promise<Financiamento | null> {
    return prisma.financiamento.findFirst({ where: { id, userId } });
  },

  async create(data: CreateFinanciamentoInput): Promise<Financiamento> {
    return prisma.financiamento.create({ data });
  },

  async update(id: string, userId: string, data: UpdateFinanciamentoInput): Promise<Financiamento> {
    const existente = await prisma.financiamento.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existente) {
      throw new Error("Financiamento não encontrado para este usuário.");
    }
    return prisma.financiamento.update({ where: { id: existente.id }, data });
  },

  async delete(id: string, userId: string): Promise<void> {
    const existente = await prisma.financiamento.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existente) return;
    await prisma.financiamento.delete({ where: { id: existente.id } });
  },
};
