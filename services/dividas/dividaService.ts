import { z } from "zod";
import { dividaRepository } from "@/repositories/dividaRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import { simularQuitacaoAntecipada } from "@/services/dividas/simulacaoQuitacaoService";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type { Divida } from "@prisma/client";

export const criarDividaSchema = z.object({
  descricao: z.string().trim().min(2, "Descrição deve ter ao menos 2 caracteres.").max(120),
  credor: z.string().trim().max(80).optional(),
  valorOriginal: z.number().positive("Valor original deve ser maior que zero."),
  valorAtual: z.number().nonnegative("Saldo devedor não pode ser negativo."),
  taxaJurosMensal: z.number().nonnegative("Taxa de juros não pode ser negativa.").max(100),
  parcelasRestantes: z.number().int().positive().optional(),
  valorParcela: z.number().positive().optional(),
  dataContratacao: z.coerce.date(),
  observacoes: z.string().trim().max(500).optional(),
});

export type CriarDividaDto = z.infer<typeof criarDividaSchema>;

export const atualizarDividaSchema = z.object({
  descricao: z.string().trim().min(2).max(120).optional(),
  credor: z.string().trim().max(80).optional(),
  valorAtual: z.number().nonnegative().optional(),
  taxaJurosMensal: z.number().nonnegative().max(100).optional(),
  parcelasRestantes: z.number().int().positive().optional(),
  valorParcela: z.number().positive().optional(),
  observacoes: z.string().trim().max(500).optional(),
});

export type AtualizarDividaDto = z.infer<typeof atualizarDividaSchema>;

export const quitarDividaSchema = z.object({
  valor: z.number().positive("Valor deve ser maior que zero.").optional(),
});

export type QuitarDividaDto = z.infer<typeof quitarDividaSchema>;

function serializarDivida(divida: Divida) {
  return {
    ...divida,
    valorOriginal: Number(divida.valorOriginal),
    valorAtual: Number(divida.valorAtual),
    taxaJurosMensal: Number(divida.taxaJurosMensal),
    valorParcela: divida.valorParcela !== null ? Number(divida.valorParcela) : null,
  };
}

const TOLERANCIA_CENTAVOS = 0.01;

export const dividaService = {
  async listar(userId: string) {
    const dividas = await dividaRepository.findAllForUser(userId);
    return dividas.map(serializarDivida);
  },

  async buscarPorId(id: string, userId: string) {
    const divida = await dividaRepository.findById(id, userId);
    if (!divida) throw new NotFoundError("Dívida não encontrada.");
    return serializarDivida(divida);
  },

  async criar(userId: string, input: CriarDividaDto) {
    const dados = criarDividaSchema.parse(input);
    const divida = await dividaRepository.create({ userId, ...dados });

    await auditLogRepository.create({ userId, action: "CREATE", entity: "Divida", entityId: divida.id });
    return serializarDivida(divida);
  },

  async atualizar(id: string, userId: string, input: AtualizarDividaDto) {
    const dados = atualizarDividaSchema.parse(input);
    const existente = await dividaRepository.findById(id, userId);
    if (!existente) throw new NotFoundError("Dívida não encontrada.");

    const atualizada = await dividaRepository.update(id, userId, dados);
    await auditLogRepository.create({ userId, action: "UPDATE", entity: "Divida", entityId: id });
    return serializarDivida(atualizada);
  },

  async excluir(id: string, userId: string) {
    const existente = await dividaRepository.findById(id, userId);
    if (!existente) throw new NotFoundError("Dívida não encontrada.");

    await dividaRepository.delete(id, userId);
    await auditLogRepository.create({ userId, action: "DELETE", entity: "Divida", entityId: id });
  },

  async simularQuitacao(id: string, userId: string) {
    const divida = await dividaRepository.findById(id, userId);
    if (!divida) throw new NotFoundError("Dívida não encontrada.");
    if (!divida.parcelasRestantes || !divida.valorParcela) {
      throw new ValidationError(
        "Informe parcelas restantes e valor da parcela nesta dívida para simular a quitação.",
        "DADOS_INSUFICIENTES_SIMULACAO",
      );
    }

    return simularQuitacaoAntecipada(
      Number(divida.valorAtual),
      divida.parcelasRestantes,
      Number(divida.valorParcela),
    );
  },

  async quitar(id: string, userId: string, input: QuitarDividaDto) {
    const dados = quitarDividaSchema.parse(input);

    const divida = await dividaRepository.findById(id, userId);
    if (!divida) throw new NotFoundError("Dívida não encontrada.");
    if (divida.status === "QUITADA") {
      throw new ValidationError("Esta dívida já está quitada.");
    }

    const valorAtual = Number(divida.valorAtual);
    const valorQuitacao = dados.valor ?? valorAtual;

    if (valorQuitacao > valorAtual + TOLERANCIA_CENTAVOS) {
      throw new ValidationError(
        `Valor maior que o saldo devedor (${valorAtual.toFixed(2)}).`,
        "VALOR_ACIMA_DO_SALDO",
      );
    }

    const novoValorAtual = valorAtual - valorQuitacao;
    const quitadaTotalmente = novoValorAtual <= TOLERANCIA_CENTAVOS;

    const atualizada = await dividaRepository.update(id, userId, {
      valorAtual: quitadaTotalmente ? 0 : novoValorAtual,
      status: quitadaTotalmente ? "QUITADA" : "ATIVA",
      dataQuitacao: quitadaTotalmente ? new Date() : null,
    });

    await auditLogRepository.create({
      userId,
      action: "QUITACAO",
      entity: "Divida",
      entityId: id,
      metadata: { valor: valorQuitacao, quitadaTotalmente },
    });

    return serializarDivida(atualizada);
  },
};
