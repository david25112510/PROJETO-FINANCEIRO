import type { ApiResponse } from "@/lib/api-response";

export type ResumoPeriodoDto = {
  dataInicio: string;
  dataFim: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
};

export type ComparacaoPeriodoDto = ResumoPeriodoDto & {
  variacaoReceitas: number | null;
  variacaoDespesas: number | null;
  variacaoSaldo: number | null;
};

export type ItemCategoriaDto = {
  categoriaId: string | null;
  nome: string;
  cor: string;
  total: number;
};

export type PontoSerieMensalDto = {
  mes: number;
  ano: number;
  receitas: number;
  despesas: number;
  saldo: number;
};

export type RelatorioDto = {
  periodo: ResumoPeriodoDto;
  comparacao: ComparacaoPeriodoDto | null;
  receitasPorCategoria: ItemCategoriaDto[];
  despesasPorCategoria: ItemCategoriaDto[];
  serieMensal: PontoSerieMensalDto[];
};

export type FiltroRelatorio = {
  dataInicio: string;
  dataFim: string;
  categoriaId?: string;
  compararDataInicio?: string;
  compararDataFim?: string;
};

function montarQuery(filtro: FiltroRelatorio): string {
  const params = new URLSearchParams();
  params.set("dataInicio", filtro.dataInicio);
  params.set("dataFim", filtro.dataFim);
  if (filtro.categoriaId) params.set("categoriaId", filtro.categoriaId);
  if (filtro.compararDataInicio) params.set("compararDataInicio", filtro.compararDataInicio);
  if (filtro.compararDataFim) params.set("compararDataFim", filtro.compararDataFim);
  return params.toString();
}

export async function buscarRelatorio(filtro: FiltroRelatorio) {
  const res = await fetch(`/api/v1/relatorios?${montarQuery(filtro)}`);
  return (await res.json()) as ApiResponse<RelatorioDto>;
}

export function urlExportarRelatorio(filtro: FiltroRelatorio, formato: "pdf" | "xlsx"): string {
  return `/api/v1/relatorios/exportar?${montarQuery(filtro)}&formato=${formato}`;
}
