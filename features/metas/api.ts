import type { ApiResponse } from "@/lib/api-response";

export type StatusMeta = "EM_ANDAMENTO" | "CONCLUIDA";

export type MetaDto = {
  id: string;
  nome: string;
  descricao: string | null;
  valorAlvo: number;
  valorAtual: number;
  dataAlvo: string;
  categoriaId: string | null;
  categoria: { id: string; nome: string; cor: string } | null;
  status: StatusMeta;
  dataConclusao: string | null;
  percentual: number;
  faltante: number;
  mesesRestantes: number;
  aporteMensalSugerido: number;
};

export type MetaFormValues = {
  nome: string;
  descricao?: string;
  valorAlvo: number;
  valorAtual?: number;
  dataAlvo: string;
  categoriaId?: string | null;
};

async function json<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json();
}

export async function listarMetas() {
  return json<MetaDto[]>(await fetch("/api/v1/metas"));
}

export async function criarMeta(valores: MetaFormValues) {
  return json<MetaDto>(
    await fetch("/api/v1/metas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores),
    }),
  );
}

export async function excluirMeta(id: string) {
  return json<null>(await fetch(`/api/v1/metas/${id}`, { method: "DELETE" }));
}

export async function aportarMeta(id: string, valor: number) {
  return json<MetaDto>(
    await fetch(`/api/v1/metas/${id}/aportar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor }),
    }),
  );
}
