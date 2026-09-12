import type { ApiResponse } from "@/lib/api-response";

export type RelatorioImportacaoDto = {
  id: string;
  totalLidos: number;
  totalImportados: number;
  totalDuplicados: number;
  totalErros: number;
};

export type ImportacaoHistoricoDto = {
  id: string;
  nomeArquivo: string;
  tipoArquivo: "OFX" | "CSV";
  totalLidos: number;
  totalImportados: number;
  totalDuplicados: number;
  totalErros: number;
  createdAt: string;
};

async function json<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json();
}

export async function importarArquivo(arquivo: File) {
  const formData = new FormData();
  formData.set("arquivo", arquivo);
  return json<RelatorioImportacaoDto>(await fetch("/api/v1/importacao", { method: "POST", body: formData }));
}

export async function listarHistoricoImportacoes() {
  return json<ImportacaoHistoricoDto[]>(await fetch("/api/v1/importacao"));
}
