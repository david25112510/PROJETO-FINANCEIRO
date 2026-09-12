import { randomUUID } from "crypto";
import { z } from "zod";
import { despesaRepository } from "@/repositories/despesaRepository";
import { categoriaRepository } from "@/repositories/categoriaRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import type { LancamentoFiltro, Paginacao } from "@/repositories/types";
import { cache } from "@/lib/cache";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { serializarValor } from "@/lib/serialize";
import { gerarDatasRecorrencia } from "@/services/financeiro/recorrenciaService";
import { dividirEmParcelas } from "@/services/financeiro/parcelamentoService";

const FREQUENCIAS = ["SEMANAL", "MENSAL", "BIMESTRAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"] as const;

export const criarDespesaSchema = z
  .object({
    categoriaId: z.string().min(1).nullable().optional(),
    descricao: z.string().trim().min(2, "Descrição deve ter ao menos 2 caracteres.").max(120),
    valor: z.number().positive("Valor deve ser maior que zero."),
    data: z.coerce.date(),
    observacoes: z.string().trim().max(500).optional(),
    recorrente: z.boolean().optional().default(false),
    frequenciaRecorrencia: z.enum(FREQUENCIAS).optional(),
    totalParcelas: z.number().int().min(2).max(60).optional(),
  })
  .refine((d) => !(d.recorrente && d.totalParcelas), {
    message: "Um lançamento não pode ser recorrente e parcelado ao mesmo tempo.",
    path: ["recorrente"],
  })
  .refine((d) => !d.recorrente || Boolean(d.frequenciaRecorrencia), {
    message: "Informe a frequência de recorrência.",
    path: ["frequenciaRecorrencia"],
  });

export type CriarDespesaDto = z.infer<typeof criarDespesaSchema>;

export const atualizarDespesaSchema = z.object({
  categoriaId: z.string().min(1).nullable().optional(),
  descricao: z.string().trim().min(2, "Descrição deve ter ao menos 2 caracteres.").max(120).optional(),
  valor: z.number().positive("Valor deve ser maior que zero.").optional(),
  data: z.coerce.date().optional(),
  observacoes: z.string().trim().max(500).optional(),
});

export type AtualizarDespesaDto = z.infer<typeof atualizarDespesaSchema>;

async function validarCategoria(userId: string, categoriaId: string | null | undefined) {
  if (!categoriaId) return;
  const categoria = await categoriaRepository.findById(categoriaId, userId);
  if (!categoria) throw new ValidationError("Categoria inválida.");
  if (categoria.tipo !== "DESPESA") {
    throw new ValidationError("A categoria selecionada é de receita, não de despesa.");
  }
}

function invalidarCacheDashboard(userId: string) {
  cache.invalidatePrefix(`dashboard:${userId}`);
}

export const despesaService = {
  async listar(userId: string, filtro: LancamentoFiltro, paginacao: Paginacao) {
    const resultado = await despesaRepository.findManyPaginated(userId, filtro, paginacao);
    return { ...resultado, itens: resultado.itens.map(serializarValor) };
  },

  async buscarPorId(id: string, userId: string) {
    const despesa = await despesaRepository.findById(id, userId);
    if (!despesa) throw new NotFoundError("Despesa não encontrada.");
    return serializarValor(despesa);
  },

  async criar(userId: string, input: CriarDespesaDto) {
    const dados = criarDespesaSchema.parse(input);
    await validarCategoria(userId, dados.categoriaId);

    let criadas;

    if (dados.recorrente && dados.frequenciaRecorrencia) {
      const grupoRecorrenciaId = randomUUID();
      const datas = gerarDatasRecorrencia(dados.data, dados.frequenciaRecorrencia);
      criadas = await despesaRepository.createMany(
        datas.map((data) => ({
          userId,
          categoriaId: dados.categoriaId ?? null,
          descricao: dados.descricao,
          valor: dados.valor,
          data,
          recorrente: true,
          frequenciaRecorrencia: dados.frequenciaRecorrencia,
          grupoRecorrenciaId,
          observacoes: dados.observacoes ?? null,
        })),
      );
    } else if (dados.totalParcelas && dados.totalParcelas > 1) {
      const grupoParcelamentoId = randomUUID();
      const parcelas = dividirEmParcelas(dados.valor, dados.totalParcelas, dados.data);
      criadas = await despesaRepository.createMany(
        parcelas.map((parcela) => ({
          userId,
          categoriaId: dados.categoriaId ?? null,
          descricao: dados.descricao,
          valor: parcela.valor,
          data: parcela.data,
          parcelaAtual: parcela.parcelaAtual,
          totalParcelas: parcela.totalParcelas,
          grupoParcelamentoId,
          observacoes: dados.observacoes ?? null,
        })),
      );
    } else {
      criadas = [
        await despesaRepository.create({
          userId,
          categoriaId: dados.categoriaId ?? null,
          descricao: dados.descricao,
          valor: dados.valor,
          data: dados.data,
          observacoes: dados.observacoes ?? null,
        }),
      ];
    }

    await auditLogRepository.create({
      userId,
      action: "CREATE",
      entity: "Despesa",
      entityId: criadas[0].id,
      metadata: { quantidadeLancamentos: criadas.length },
    });

    invalidarCacheDashboard(userId);
    return criadas.map(serializarValor);
  },

  async atualizar(id: string, userId: string, input: AtualizarDespesaDto) {
    const dados = atualizarDespesaSchema.parse(input);
    await validarCategoria(userId, dados.categoriaId);

    const existente = await despesaRepository.findById(id, userId);
    if (!existente) throw new NotFoundError("Despesa não encontrada.");

    const atualizada = await despesaRepository.update(id, userId, dados);

    await auditLogRepository.create({
      userId,
      action: "UPDATE",
      entity: "Despesa",
      entityId: id,
    });

    invalidarCacheDashboard(userId);
    return serializarValor(atualizada);
  },

  async excluir(id: string, userId: string, opts?: { serieCompleta?: boolean }) {
    const despesa = await despesaRepository.findById(id, userId);
    if (!despesa) throw new NotFoundError("Despesa não encontrada.");

    if (opts?.serieCompleta && despesa.grupoRecorrenciaId) {
      await despesaRepository.deleteFuturasByGrupo(despesa.grupoRecorrenciaId, userId, despesa.data);
    } else {
      await despesaRepository.delete(id, userId);
    }

    await auditLogRepository.create({
      userId,
      action: "DELETE",
      entity: "Despesa",
      entityId: id,
    });

    invalidarCacheDashboard(userId);
  },
};
