import type { LancamentoFiltro, Paginacao } from "@/repositories/types";

const PAGE_SIZE_PADRAO = 20;
const PAGE_SIZE_MAXIMO = 100;

export function parsePaginacao(searchParams: URLSearchParams): Paginacao {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(
    PAGE_SIZE_MAXIMO,
    Math.max(1, Number(searchParams.get("pageSize")) || PAGE_SIZE_PADRAO),
  );
  return { page, pageSize };
}

export function parseLancamentoFiltro(searchParams: URLSearchParams): LancamentoFiltro {
  const dataInicio = searchParams.get("dataInicio");
  const dataFim = searchParams.get("dataFim");
  const categoriaId = searchParams.get("categoriaId");
  const busca = searchParams.get("busca");

  return {
    dataInicio: dataInicio ? new Date(dataInicio) : undefined,
    dataFim: dataFim ? new Date(dataFim) : undefined,
    categoriaId: categoriaId ?? undefined,
    busca: busca ?? undefined,
  };
}
