import type { FrequenciaRecorrencia } from "@prisma/client";

export type LancamentoFiltro = {
  dataInicio?: Date;
  dataFim?: Date;
  categoriaId?: string;
  busca?: string;
};

export type Paginacao = {
  page: number;
  pageSize: number;
};

export type PaginaResultado<T> = {
  itens: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateLancamentoInput = {
  userId: string;
  categoriaId?: string | null;
  descricao: string;
  valor: number;
  data: Date;
  recorrente?: boolean;
  frequenciaRecorrencia?: FrequenciaRecorrencia | null;
  grupoRecorrenciaId?: string | null;
  parcelaAtual?: number | null;
  totalParcelas?: number | null;
  grupoParcelamentoId?: string | null;
  observacoes?: string | null;
};

export type UpdateLancamentoInput = Partial<
  Omit<CreateLancamentoInput, "userId" | "grupoRecorrenciaId" | "grupoParcelamentoId">
>;

export type TotalPorCategoria = {
  categoriaId: string | null;
  total: number;
};
