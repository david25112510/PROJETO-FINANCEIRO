import type { ApiResponse } from "@/lib/api-response";

export type NivelSaude = "critico" | "atencao" | "bom" | "excelente";

export type ComponenteScoreDto = {
  chave: string;
  nome: string;
  pontuacao: number;
  pontuacaoMaxima: number;
  descricao: string;
};

export type ScoreSaudeDto = {
  score: number;
  nivel: NivelSaude;
  componentes: ComponenteScoreDto[];
};

export type SeveridadeInsight = "info" | "atencao" | "critico";

export type InsightDto = {
  tipo: string;
  severidade: SeveridadeInsight;
  titulo: string;
  mensagem: string;
};

export type AjustesSimulacao = {
  percentualReceitas: number;
  percentualDespesas: number;
  receitaAdicionalMensal: number;
  despesaAdicionalMensal: number;
  meses: number;
};

export type PontoProjecaoDto = {
  mes: number;
  receitas: number;
  despesas: number;
  saldoMes: number;
  saldoAcumulado: number;
};

export type ResultadoSimulacaoDto = {
  baseline: { receitas: number; despesas: number; saldo: number };
  simulado: { receitas: number; despesas: number; saldo: number };
  projecao: PontoProjecaoDto[];
};

export type SugestaoCategoriaDto = {
  categoriaId: string;
  nome: string;
  cor: string;
  ocorrencias: number;
};

async function json<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json();
}

export async function buscarScoreSaude() {
  return json<ScoreSaudeDto>(await fetch("/api/v1/inteligencia/score"));
}

export async function buscarInsights() {
  return json<InsightDto[]>(await fetch("/api/v1/inteligencia/insights"));
}

export async function simular(ajustes: AjustesSimulacao) {
  return json<ResultadoSimulacaoDto>(
    await fetch("/api/v1/inteligencia/simular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ajustes),
    }),
  );
}

export async function sugerirCategoria(descricao: string, tipo: "RECEITA" | "DESPESA") {
  const params = new URLSearchParams({ descricao, tipo });
  return json<SugestaoCategoriaDto | null>(await fetch(`/api/v1/inteligencia/sugerir-categoria?${params}`));
}
