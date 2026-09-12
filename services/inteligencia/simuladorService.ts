import { z } from "zod";
import { receitaRepository } from "@/repositories/receitaRepository";
import { despesaRepository } from "@/repositories/despesaRepository";
import { compraRepository } from "@/repositories/compraRepository";

export const ajustesSimulacaoSchema = z.object({
  percentualReceitas: z.number().min(-100).max(500).default(0),
  percentualDespesas: z.number().min(-100).max(500).default(0),
  receitaAdicionalMensal: z.number().default(0),
  despesaAdicionalMensal: z.number().default(0),
  meses: z.number().int().min(1).max(24).default(6),
});

export type AjustesSimulacaoDto = z.infer<typeof ajustesSimulacaoSchema>;

export type PontoProjecao = {
  mes: number;
  receitas: number;
  despesas: number;
  saldoMes: number;
  saldoAcumulado: number;
};

export type ResultadoSimulacao = {
  baseline: { receitas: number; despesas: number; saldo: number };
  simulado: { receitas: number; despesas: number; saldo: number };
  projecao: PontoProjecao[];
};

const MESES_BASELINE = 3;

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/** Base histórica: média dos últimos meses de receitas/despesas reais (inclui compras de cartão). */
async function calcularBaseline(userId: string) {
  const hoje = new Date();
  let receitas = 0;
  let despesas = 0;

  for (let i = 0; i < MESES_BASELINE; i++) {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const [r, d, c] = await Promise.all([
      receitaRepository.somaPorPeriodo(userId, inicio, fim),
      despesaRepository.somaPorPeriodo(userId, inicio, fim),
      compraRepository.somaPorPeriodo(userId, inicio, fim),
    ]);
    receitas += r;
    despesas += d + c;
  }

  return { receitas: receitas / MESES_BASELINE, despesas: despesas / MESES_BASELINE };
}

export const simuladorService = {
  async simular(userId: string, input: unknown): Promise<ResultadoSimulacao> {
    const ajustes = ajustesSimulacaoSchema.parse(input);
    const baseline = await calcularBaseline(userId);

    const receitasSimuladas = baseline.receitas * (1 + ajustes.percentualReceitas / 100) + ajustes.receitaAdicionalMensal;
    const despesasSimuladas = baseline.despesas * (1 + ajustes.percentualDespesas / 100) + ajustes.despesaAdicionalMensal;
    const saldoMes = receitasSimuladas - despesasSimuladas;

    const projecao: PontoProjecao[] = [];
    let saldoAcumulado = 0;
    for (let mes = 1; mes <= ajustes.meses; mes++) {
      saldoAcumulado += saldoMes;
      projecao.push({
        mes,
        receitas: arredondar(receitasSimuladas),
        despesas: arredondar(despesasSimuladas),
        saldoMes: arredondar(saldoMes),
        saldoAcumulado: arredondar(saldoAcumulado),
      });
    }

    return {
      baseline: {
        receitas: arredondar(baseline.receitas),
        despesas: arredondar(baseline.despesas),
        saldo: arredondar(baseline.receitas - baseline.despesas),
      },
      simulado: {
        receitas: arredondar(receitasSimuladas),
        despesas: arredondar(despesasSimuladas),
        saldo: arredondar(saldoMes),
      },
      projecao,
    };
  },
};
