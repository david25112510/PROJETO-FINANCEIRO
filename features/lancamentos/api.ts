import type { ApiResponse } from "@/lib/api-response";

export type Recurso = "receitas" | "despesas";
export type TipoCategoria = "RECEITA" | "DESPESA";

export type CategoriaDto = {
  id: string;
  nome: string;
  tipo: TipoCategoria;
  cor: string;
};

export type LancamentoDto = {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: string | null;
  categoria: CategoriaDto | null;
  recorrente: boolean;
  frequenciaRecorrencia: string | null;
  grupoRecorrenciaId: string | null;
  parcelaAtual: number | null;
  totalParcelas: number | null;
  grupoParcelamentoId: string | null;
  observacoes: string | null;
};

export type PaginaLancamentos = {
  itens: LancamentoDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type FiltroLancamentos = {
  page: number;
  pageSize: number;
  busca?: string;
  categoriaId?: string;
};

export type LancamentoFormValues = {
  categoriaId?: string | null;
  descricao: string;
  valor: number;
  data: string;
  observacoes?: string;
  recorrente?: boolean;
  frequenciaRecorrencia?: string;
  totalParcelas?: number;
};

function montarQuery(filtro: FiltroLancamentos): string {
  const params = new URLSearchParams();
  params.set("page", String(filtro.page));
  params.set("pageSize", String(filtro.pageSize));
  if (filtro.busca) params.set("busca", filtro.busca);
  if (filtro.categoriaId) params.set("categoriaId", filtro.categoriaId);
  return params.toString();
}

export async function listarLancamentos(recurso: Recurso, filtro: FiltroLancamentos) {
  const res = await fetch(`/api/v1/${recurso}?${montarQuery(filtro)}`);
  return (await res.json()) as ApiResponse<PaginaLancamentos>;
}

export async function criarLancamento(recurso: Recurso, valores: LancamentoFormValues) {
  const res = await fetch(`/api/v1/${recurso}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(valores),
  });
  return (await res.json()) as ApiResponse<LancamentoDto[]>;
}

export async function atualizarLancamento(
  recurso: Recurso,
  id: string,
  valores: Partial<LancamentoFormValues>,
) {
  const res = await fetch(`/api/v1/${recurso}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(valores),
  });
  return (await res.json()) as ApiResponse<LancamentoDto>;
}

export async function excluirLancamento(recurso: Recurso, id: string, serieCompleta?: boolean) {
  const query = serieCompleta ? "?serieCompleta=true" : "";
  const res = await fetch(`/api/v1/${recurso}/${id}${query}`, { method: "DELETE" });
  return (await res.json()) as ApiResponse<null>;
}

export async function listarCategorias(tipo: TipoCategoria) {
  const res = await fetch(`/api/v1/categorias?tipo=${tipo}`);
  return (await res.json()) as ApiResponse<CategoriaDto[]>;
}

export async function criarCategoria(nome: string, tipo: TipoCategoria) {
  const res = await fetch("/api/v1/categorias", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, tipo }),
  });
  return (await res.json()) as ApiResponse<CategoriaDto>;
}
