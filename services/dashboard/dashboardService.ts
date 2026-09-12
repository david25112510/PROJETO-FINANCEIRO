import { receitaRepository } from "@/repositories/receitaRepository";
import { despesaRepository } from "@/repositories/despesaRepository";
import { compraRepository } from "@/repositories/compraRepository";
import { cache } from "@/lib/cache";

const TTL_CACHE_MS = 60_000;

export type IndicadoresDashboard = {
  saldoMes: number;
  receitasMes: number;
  despesasMes: number;
  variacaoSaldoPercentual: number | null;
  atualizadoEm: string;
};

function inicioDoMes(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

function fimDoMes(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59, 999);
}

function mesAnterior(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth() - 1, 1);
}

function calcularVariacaoPercentual(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

export const dashboardService = {
  async getIndicadores(userId: string): Promise<IndicadoresDashboard> {
    const cacheKey = `dashboard:${userId}:resumo`;
    const emCache = cache.get<IndicadoresDashboard>(cacheKey);
    if (emCache) return emCache;

    const hoje = new Date();
    const inicioAtual = inicioDoMes(hoje);
    const fimAtual = fimDoMes(hoje);
    const inicioAnterior = inicioDoMes(mesAnterior(hoje));
    const fimAnterior = fimDoMes(mesAnterior(hoje));

    const [
      receitasMes,
      despesasDiretasMes,
      comprasMes,
      receitasMesAnterior,
      despesasDiretasMesAnterior,
      comprasMesAnterior,
    ] = await Promise.all([
      receitaRepository.somaPorPeriodo(userId, inicioAtual, fimAtual),
      despesaRepository.somaPorPeriodo(userId, inicioAtual, fimAtual),
      compraRepository.somaPorPeriodo(userId, inicioAtual, fimAtual),
      receitaRepository.somaPorPeriodo(userId, inicioAnterior, fimAnterior),
      despesaRepository.somaPorPeriodo(userId, inicioAnterior, fimAnterior),
      compraRepository.somaPorPeriodo(userId, inicioAnterior, fimAnterior),
    ]);

    const despesasMes = despesasDiretasMes + comprasMes;
    const despesasMesAnterior = despesasDiretasMesAnterior + comprasMesAnterior;
    const saldoMes = receitasMes - despesasMes;
    const saldoMesAnterior = receitasMesAnterior - despesasMesAnterior;

    const indicadores: IndicadoresDashboard = {
      saldoMes,
      receitasMes,
      despesasMes,
      variacaoSaldoPercentual: calcularVariacaoPercentual(saldoMes, saldoMesAnterior),
      atualizadoEm: new Date().toISOString(),
    };

    cache.set(cacheKey, indicadores, TTL_CACHE_MS);
    return indicadores;
  },
};
