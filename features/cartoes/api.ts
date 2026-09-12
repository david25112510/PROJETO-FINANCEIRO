import type { ApiResponse } from "@/lib/api-response";

export type NivelAlerta = "normal" | "atencao" | "critico";

export type CartaoDto = {
  id: string;
  nome: string;
  bandeira: string | null;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
  cor: string;
  ativo: boolean;
  limiteUsado: number;
  limiteDisponivel: number;
  percentualUsado: number;
  nivelAlerta: NivelAlerta;
};

export type StatusFatura = "ABERTA" | "FECHADA" | "PAGA_PARCIAL" | "PAGA";

export type FaturaDto = {
  id: string;
  cartaoId: string;
  mesReferencia: number;
  anoReferencia: number;
  dataFechamento: string;
  dataVencimento: string;
  status: StatusFatura;
  valorTotal: number;
  valorPago: number;
};

export type CompraDto = {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: string | null;
  categoria: { id: string; nome: string; cor: string } | null;
  parcelaAtual: number | null;
  totalParcelas: number | null;
  grupoParcelamentoId: string | null;
  observacoes: string | null;
};

export type FaturaComComprasDto = FaturaDto & { compras: CompraDto[] };

export type CartaoFormValues = {
  nome: string;
  bandeira?: string;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
  cor?: string;
};

export type CompraFormValues = {
  categoriaId?: string | null;
  descricao: string;
  valor: number;
  data: string;
  observacoes?: string;
  totalParcelas?: number;
};

async function json<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json();
}

export async function listarCartoes() {
  return json<CartaoDto[]>(await fetch("/api/v1/cartoes"));
}

export async function buscarCartao(id: string) {
  return json<CartaoDto>(await fetch(`/api/v1/cartoes/${id}`));
}

export async function criarCartao(valores: CartaoFormValues) {
  return json<CartaoDto>(
    await fetch("/api/v1/cartoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores),
    }),
  );
}

export async function atualizarCartao(id: string, valores: Partial<CartaoFormValues> & { ativo?: boolean }) {
  return json<CartaoDto>(
    await fetch(`/api/v1/cartoes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores),
    }),
  );
}

export async function excluirCartao(id: string) {
  return json<null>(await fetch(`/api/v1/cartoes/${id}`, { method: "DELETE" }));
}

export async function listarFaturas(cartaoId: string) {
  return json<FaturaDto[]>(await fetch(`/api/v1/cartoes/${cartaoId}/faturas`));
}

export async function buscarFatura(id: string) {
  return json<FaturaComComprasDto>(await fetch(`/api/v1/faturas/${id}`));
}

export async function pagarFatura(id: string, valor: number) {
  return json<FaturaDto>(
    await fetch(`/api/v1/faturas/${id}/pagar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor }),
    }),
  );
}

export async function criarCompra(cartaoId: string, valores: CompraFormValues) {
  return json<CompraDto[]>(
    await fetch(`/api/v1/cartoes/${cartaoId}/compras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores),
    }),
  );
}

export async function excluirCompra(id: string) {
  return json<null>(await fetch(`/api/v1/compras/${id}`, { method: "DELETE" }));
}
