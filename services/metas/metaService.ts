import { z } from "zod";
import { metaRepository } from "@/repositories/metaRepository";
import { categoriaRepository } from "@/repositories/categoriaRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import { calcularSugestaoAporte } from "@/services/metas/sugestaoAporteService";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type { Meta } from "@prisma/client";

export const criarMetaSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres.").max(80),
  descricao: z.string().trim().max(500).optional(),
  valorAlvo: z.number().positive("Valor alvo deve ser maior que zero."),
  valorAtual: z.number().nonnegative("Valor já guardado não pode ser negativo.").optional(),
  dataAlvo: z.coerce.date(),
  categoriaId: z.string().min(1).nullable().optional(),
});

export type CriarMetaDto = z.infer<typeof criarMetaSchema>;

export const atualizarMetaSchema = z.object({
  nome: z.string().trim().min(2).max(80).optional(),
  descricao: z.string().trim().max(500).optional(),
  valorAlvo: z.number().positive().optional(),
  dataAlvo: z.coerce.date().optional(),
  categoriaId: z.string().min(1).nullable().optional(),
});

export type AtualizarMetaDto = z.infer<typeof atualizarMetaSchema>;

export const aportarMetaSchema = z.object({
  valor: z.number().positive("Valor deve ser maior que zero."),
});

export type AportarMetaDto = z.infer<typeof aportarMetaSchema>;

function comProgresso<T extends { valorAlvo: unknown; valorAtual: unknown; dataAlvo: Date }>(meta: T) {
  const valorAlvo = Number(meta.valorAlvo);
  const valorAtual = Number(meta.valorAtual);
  const percentual = valorAlvo > 0 ? Math.min(100, (valorAtual / valorAlvo) * 100) : 0;
  const sugestao = calcularSugestaoAporte(valorAlvo, valorAtual, meta.dataAlvo);

  return { ...meta, valorAlvo, valorAtual, percentual: Math.round(percentual), ...sugestao };
}

async function validarCategoria(userId: string, categoriaId: string | null | undefined) {
  if (!categoriaId) return;
  const categoria = await categoriaRepository.findById(categoriaId, userId);
  if (!categoria) throw new ValidationError("Categoria inválida.");
}

const TOLERANCIA_CENTAVOS = 0.01;

export const metaService = {
  async listar(userId: string) {
    const metas = await metaRepository.findAllForUser(userId);
    return metas.map(comProgresso);
  },

  async buscarPorId(id: string, userId: string) {
    const meta = await metaRepository.findById(id, userId);
    if (!meta) throw new NotFoundError("Meta não encontrada.");
    return comProgresso(meta);
  },

  async criar(userId: string, input: CriarMetaDto) {
    const dados = criarMetaSchema.parse(input);
    await validarCategoria(userId, dados.categoriaId);

    const meta = await metaRepository.create({ userId, ...dados });
    await auditLogRepository.create({ userId, action: "CREATE", entity: "Meta", entityId: meta.id });
    return comProgresso(meta);
  },

  async atualizar(id: string, userId: string, input: AtualizarMetaDto) {
    const dados = atualizarMetaSchema.parse(input);
    await validarCategoria(userId, dados.categoriaId);

    const existente = await metaRepository.findById(id, userId);
    if (!existente) throw new NotFoundError("Meta não encontrada.");

    const atualizada = await metaRepository.update(id, userId, dados);
    await auditLogRepository.create({ userId, action: "UPDATE", entity: "Meta", entityId: id });
    return comProgresso(atualizada);
  },

  async excluir(id: string, userId: string) {
    const existente = await metaRepository.findById(id, userId);
    if (!existente) throw new NotFoundError("Meta não encontrada.");

    await metaRepository.delete(id, userId);
    await auditLogRepository.create({ userId, action: "DELETE", entity: "Meta", entityId: id });
  },

  async aportar(id: string, userId: string, input: AportarMetaDto) {
    const dados = aportarMetaSchema.parse(input);

    const meta = await metaRepository.findById(id, userId);
    if (!meta) throw new NotFoundError("Meta não encontrada.");
    if (meta.status === "CONCLUIDA") {
      throw new ValidationError("Esta meta já foi concluída.");
    }

    const novoValorAtual = Number(meta.valorAtual) + dados.valor;
    const concluida = novoValorAtual >= Number(meta.valorAlvo) - TOLERANCIA_CENTAVOS;

    const atualizada: Meta = await metaRepository.update(id, userId, {
      valorAtual: novoValorAtual,
      status: concluida ? "CONCLUIDA" : "EM_ANDAMENTO",
      dataConclusao: concluida ? new Date() : null,
    });

    await auditLogRepository.create({
      userId,
      action: "APORTE",
      entity: "Meta",
      entityId: id,
      metadata: { valor: dados.valor, concluida },
    });

    return comProgresso(atualizada);
  },
};
