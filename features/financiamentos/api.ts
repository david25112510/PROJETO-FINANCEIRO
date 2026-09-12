import type { ApiResponse } from "@/lib/api-response";

export type SistemaAmortizacao = "PRICE" | "SAC";
export type StatusFinanciamento = "ATIVO" | "QUITADO";

export type FinanciamentoDto = {
  id: string;
  descricao: string;
  valorTotal: number;
  taxaJurosMensal: number;
  numeroParcelas: number;
  sistemaAmortizacao: SistemaAmortizacao;
  dataContratacao: string;
  status: StatusFinanciamento;
  observacoes: string | null;
};

export type FinanciamentoFormValues = {
  descricao: string;
  valorTotal: number;
  taxaJurosMensal: number;
  numeroParcelas: number;
  sistemaAmortizacao: SistemaAmortizacao;
  dataContratacao: string;
  observacoes?: string;
};

export type ParcelaAmortizacaoDto = {
  numero: number;
  valorParcela: number;
  juros: number;
  amortizacao: number;
  saldoDevedor: number;
};

export type ResumoAmortizacaoDto = {
  totalPago: number;
  totalJuros: number;
  primeiraParcela: number;
  ultimaParcela: number;
};

export type AmortizacaoDto = {
  sistemaAmortizacao: SistemaAmortizacao;
  parcelas: ParcelaAmortizacaoDto[];
  resumo: ResumoAmortizacaoDto;
  comparador: { price: ResumoAmortizacaoDto; sac: ResumoAmortizacaoDto };
};

async function json<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json();
}

export async function listarFinanciamentos() {
  return json<FinanciamentoDto[]>(await fetch("/api/v1/financiamentos"));
}

export async function buscarFinanciamento(id: string) {
  return json<FinanciamentoDto>(await fetch(`/api/v1/financiamentos/${id}`));
}

export async function criarFinanciamento(valores: FinanciamentoFormValues) {
  return json<FinanciamentoDto>(
    await fetch("/api/v1/financiamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores),
    }),
  );
}

export async function excluirFinanciamento(id: string) {
  return json<null>(await fetch(`/api/v1/financiamentos/${id}`, { method: "DELETE" }));
}

export async function buscarAmortizacao(id: string) {
  return json<AmortizacaoDto>(await fetch(`/api/v1/financiamentos/${id}/amortizacao`));
}
