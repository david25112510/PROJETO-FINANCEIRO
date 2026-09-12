import { z } from "zod";
import { receitaRepository } from "@/repositories/receitaRepository";
import { despesaRepository } from "@/repositories/despesaRepository";
import { compraRepository } from "@/repositories/compraRepository";
import { categoriaRepository } from "@/repositories/categoriaRepository";
import type { TotalPorCategoria } from "@/repositories/types";
import { ValidationError } from "@/lib/errors";

export const filtroRelatorioSchema = z
  .object({
    dataInicio: z.coerce.date(),
    dataFim: z.coerce.date(),
    categoriaId: z.string().min(1).optional(),
    compararDataInicio: z.coerce.date().optional(),
    compararDataFim: z.coerce.date().optional(),
  })
  .refine((d) => d.dataFim >= d.dataInicio, {
    message: "A data final deve ser igual ou posterior à data inicial.",
    path: ["dataFim"],
  });

export type FiltroRelatorioDto = z.infer<typeof filtroRelatorioSchema>;

export type ResumoPeriodo = {
  dataInicio: string;
  dataFim: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
};

export type ComparacaoPeriodo = ResumoPeriodo & {
  variacaoReceitas: number | null;
  variacaoDespesas: number | null;
  variacaoSaldo: number | null;
};

export type ItemCategoria = {
  categoriaId: string | null;
  nome: string;
  cor: string;
  total: number;
};

export type PontoSerieMensal = {
  mes: number;
  ano: number;
  receitas: number;
  despesas: number;
  saldo: number;
};

export type RelatorioResultado = {
  periodo: ResumoPeriodo;
  comparacao: ComparacaoPeriodo | null;
  receitasPorCategoria: ItemCategoria[];
  despesasPorCategoria: ItemCategoria[];
  serieMensal: PontoSerieMensal[];
};

const LIMITE_MESES_SERIE = 25;

function calcularVariacao(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

async function calcularTotais(userId: string, dataInicio: Date, dataFim: Date, categoriaId?: string) {
  const [receitas, despesasDiretas, compras] = await Promise.all([
    receitaRepository.somaPorPeriodo(userId, dataInicio, dataFim, categoriaId),
    despesaRepository.somaPorPeriodo(userId, dataInicio, dataFim, categoriaId),
    compraRepository.somaPorPeriodo(userId, dataInicio, dataFim, categoriaId),
  ]);
  const despesas = despesasDiretas + compras;
  return { receitas, despesas, saldo: receitas - despesas };
}

async function calcularResumo(
  userId: string,
  dataInicio: Date,
  dataFim: Date,
  categoriaId?: string,
): Promise<ResumoPeriodo> {
  const totais = await calcularTotais(userId, dataInicio, dataFim, categoriaId);
  return {
    dataInicio: dataInicio.toISOString(),
    dataFim: dataFim.toISOString(),
    totalReceitas: totais.receitas,
    totalDespesas: totais.despesas,
    saldo: totais.saldo,
  };
}

export function combinarTotaisPorCategoria(...listas: TotalPorCategoria[][]): TotalPorCategoria[] {
  const combinados = new Map<string | null, number>();
  for (const item of listas.flat()) {
    combinados.set(item.categoriaId, (combinados.get(item.categoriaId) ?? 0) + item.total);
  }
  return Array.from(combinados.entries()).map(([categoriaId, total]) => ({ categoriaId, total }));
}

async function calcularPorCategoria(
  userId: string,
  dataInicio: Date,
  dataFim: Date,
  tipo: "RECEITA" | "DESPESA",
): Promise<ItemCategoria[]> {
  const categorias = await categoriaRepository.findAllForUser(userId, tipo);
  const mapaCategorias = new Map(categorias.map((c) => [c.id, c]));

  const totais =
    tipo === "RECEITA"
      ? await receitaRepository.somaPorCategoria(userId, dataInicio, dataFim)
      : combinarTotaisPorCategoria(
          await despesaRepository.somaPorCategoria(userId, dataInicio, dataFim),
          await compraRepository.somaPorCategoria(userId, dataInicio, dataFim),
        );

  return totais
    .filter((t) => t.total > 0)
    .map((t) => {
      const categoria = t.categoriaId ? mapaCategorias.get(t.categoriaId) : undefined;
      return {
        categoriaId: t.categoriaId,
        nome: categoria?.nome ?? "Sem categoria",
        cor: categoria?.cor ?? "#626c78",
        total: t.total,
      };
    })
    .sort((a, b) => b.total - a.total);
}

function mesesNoIntervalo(dataInicio: Date, dataFim: Date): { ano: number; mes: number }[] {
  const meses: { ano: number; mes: number }[] = [];
  let ano = dataInicio.getFullYear();
  let mes = dataInicio.getMonth();
  const anoFim = dataFim.getFullYear();
  const mesFim = dataFim.getMonth();

  while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
    meses.push({ ano, mes });
    mes += 1;
    if (mes > 11) {
      mes = 0;
      ano += 1;
    }
  }
  return meses;
}

async function calcularSerieMensal(
  userId: string,
  dataInicio: Date,
  dataFim: Date,
  categoriaId?: string,
): Promise<PontoSerieMensal[]> {
  const meses = mesesNoIntervalo(dataInicio, dataFim);
  if (meses.length > LIMITE_MESES_SERIE) {
    throw new ValidationError(`Intervalo muito longo para o relatório (máximo ${LIMITE_MESES_SERIE} meses).`);
  }

  return Promise.all(
    meses.map(async ({ ano, mes }) => {
      const inicioMes = new Date(ano, mes, 1);
      const fimMes = new Date(ano, mes + 1, 0, 23, 59, 59, 999);
      const totais = await calcularTotais(userId, inicioMes, fimMes, categoriaId);
      return { mes: mes + 1, ano, receitas: totais.receitas, despesas: totais.despesas, saldo: totais.saldo };
    }),
  );
}

export const relatorioService = {
  async gerar(userId: string, input: unknown): Promise<RelatorioResultado> {
    const filtro = filtroRelatorioSchema.parse(input);

    const [periodo, receitasPorCategoria, despesasPorCategoria, serieMensal] = await Promise.all([
      calcularResumo(userId, filtro.dataInicio, filtro.dataFim, filtro.categoriaId),
      calcularPorCategoria(userId, filtro.dataInicio, filtro.dataFim, "RECEITA"),
      calcularPorCategoria(userId, filtro.dataInicio, filtro.dataFim, "DESPESA"),
      calcularSerieMensal(userId, filtro.dataInicio, filtro.dataFim, filtro.categoriaId),
    ]);

    let comparacao: ComparacaoPeriodo | null = null;
    if (filtro.compararDataInicio && filtro.compararDataFim) {
      const resumoComparacao = await calcularResumo(
        userId,
        filtro.compararDataInicio,
        filtro.compararDataFim,
        filtro.categoriaId,
      );
      comparacao = {
        ...resumoComparacao,
        variacaoReceitas: calcularVariacao(periodo.totalReceitas, resumoComparacao.totalReceitas),
        variacaoDespesas: calcularVariacao(periodo.totalDespesas, resumoComparacao.totalDespesas),
        variacaoSaldo: calcularVariacao(periodo.saldo, resumoComparacao.saldo),
      };
    }

    return { periodo, comparacao, receitasPorCategoria, despesasPorCategoria, serieMensal };
  },
};
