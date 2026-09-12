import { z } from "zod";
import { financiamentoRepository } from "@/repositories/financiamentoRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import {
  calcularTabelaAmortizacao,
  compararSistemasAmortizacao,
  resumirTabela,
} from "@/services/financiamentos/amortizacaoService";
import { NotFoundError } from "@/lib/errors";
import type { Financiamento } from "@prisma/client";

export const criarFinanciamentoSchema = z.object({
  descricao: z.string().trim().min(2, "Descrição deve ter ao menos 2 caracteres.").max(120),
  valorTotal: z.number().positive("Valor deve ser maior que zero."),
  taxaJurosMensal: z.number().nonnegative("Taxa de juros não pode ser negativa.").max(100),
  numeroParcelas: z.number().int().min(1).max(600),
  sistemaAmortizacao: z.enum(["PRICE", "SAC"]),
  dataContratacao: z.coerce.date(),
  observacoes: z.string().trim().max(500).optional(),
});

export type CriarFinanciamentoDto = z.infer<typeof criarFinanciamentoSchema>;

export const atualizarFinanciamentoSchema = z.object({
  descricao: z.string().trim().min(2).max(120).optional(),
  observacoes: z.string().trim().max(500).optional(),
  status: z.enum(["ATIVO", "QUITADO"]).optional(),
});

export type AtualizarFinanciamentoDto = z.infer<typeof atualizarFinanciamentoSchema>;

function serializarFinanciamento(financiamento: Financiamento) {
  return {
    ...financiamento,
    valorTotal: Number(financiamento.valorTotal),
    taxaJurosMensal: Number(financiamento.taxaJurosMensal),
  };
}

export const financiamentoService = {
  async listar(userId: string) {
    const financiamentos = await financiamentoRepository.findAllForUser(userId);
    return financiamentos.map(serializarFinanciamento);
  },

  async buscarPorId(id: string, userId: string) {
    const financiamento = await financiamentoRepository.findById(id, userId);
    if (!financiamento) throw new NotFoundError("Financiamento não encontrado.");
    return serializarFinanciamento(financiamento);
  },

  async criar(userId: string, input: CriarFinanciamentoDto) {
    const dados = criarFinanciamentoSchema.parse(input);
    const financiamento = await financiamentoRepository.create({ userId, ...dados });

    await auditLogRepository.create({ userId, action: "CREATE", entity: "Financiamento", entityId: financiamento.id });
    return serializarFinanciamento(financiamento);
  },

  async atualizar(id: string, userId: string, input: AtualizarFinanciamentoDto) {
    const dados = atualizarFinanciamentoSchema.parse(input);
    const existente = await financiamentoRepository.findById(id, userId);
    if (!existente) throw new NotFoundError("Financiamento não encontrado.");

    const atualizado = await financiamentoRepository.update(id, userId, dados);
    await auditLogRepository.create({ userId, action: "UPDATE", entity: "Financiamento", entityId: id });
    return serializarFinanciamento(atualizado);
  },

  async excluir(id: string, userId: string) {
    const existente = await financiamentoRepository.findById(id, userId);
    if (!existente) throw new NotFoundError("Financiamento não encontrado.");

    await financiamentoRepository.delete(id, userId);
    await auditLogRepository.create({ userId, action: "DELETE", entity: "Financiamento", entityId: id });
  },

  /** Tabela de amortização do sistema contratado + comparador Price × SAC. */
  async amortizacao(id: string, userId: string) {
    const financiamento = await financiamentoRepository.findById(id, userId);
    if (!financiamento) throw new NotFoundError("Financiamento não encontrado.");

    const valorTotal = Number(financiamento.valorTotal);
    const taxaJurosMensal = Number(financiamento.taxaJurosMensal);

    const parcelas = calcularTabelaAmortizacao(
      financiamento.sistemaAmortizacao,
      valorTotal,
      taxaJurosMensal,
      financiamento.numeroParcelas,
    );

    return {
      sistemaAmortizacao: financiamento.sistemaAmortizacao,
      parcelas,
      resumo: resumirTabela(parcelas),
      comparador: compararSistemasAmortizacao(valorTotal, taxaJurosMensal, financiamento.numeroParcelas),
    };
  },
};
