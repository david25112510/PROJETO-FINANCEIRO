import type { ApiResponse } from "@/lib/api-response";

export type StatusDivida = "ATIVA" | "QUITADA";

export type DividaDto = {
  id: string;
  descricao: string;
  credor: string | null;
  valorOriginal: number;
  valorAtual: number;
  taxaJurosMensal: number;
  parcelasRestantes: number | null;
  valorParcela: number | null;
  dataContratacao: string;
  status: StatusDivida;
  dataQuitacao: string | null;
  observacoes: string | null;
};

export type DividaFormValues = {
  descricao: string;
  credor?: string;
  valorOriginal: number;
  valorAtual: number;
  taxaJurosMensal: number;
  parcelasRestantes?: number;
  valorParcela?: number;
  dataContratacao: string;
  observacoes?: string;
};

export type SimulacaoQuitacaoDto = {
  valorQuitacaoHoje: number;
  totalSeContinuar: number;
  economiaEstimada: number;
  parcelasRestantes: number;
};

async function json<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json();
}

export async function listarDividas() {
  return json<DividaDto[]>(await fetch("/api/v1/dividas"));
}

export async function criarDivida(valores: DividaFormValues) {
  return json<DividaDto>(
    await fetch("/api/v1/dividas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores),
    }),
  );
}

export async function atualizarDivida(id: string, valores: Partial<DividaFormValues>) {
  return json<DividaDto>(
    await fetch(`/api/v1/dividas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores),
    }),
  );
}

export async function excluirDivida(id: string) {
  return json<null>(await fetch(`/api/v1/dividas/${id}`, { method: "DELETE" }));
}

export async function simularQuitacao(id: string) {
  return json<SimulacaoQuitacaoDto>(await fetch(`/api/v1/dividas/${id}/simular-quitacao`));
}

export async function quitarDivida(id: string, valor?: number) {
  return json<DividaDto>(
    await fetch(`/api/v1/dividas/${id}/quitar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valor ? { valor } : {}),
    }),
  );
}
