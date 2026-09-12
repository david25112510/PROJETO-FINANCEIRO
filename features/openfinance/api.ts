import type { ApiResponse } from "@/lib/api-response";

export type StatusConsentimentoDto = {
  consentido: boolean;
  consentidoEm: string | null;
  revogadoEm: string | null;
};

async function json<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json();
}

export async function buscarStatusConsentimento() {
  return json<StatusConsentimentoDto>(await fetch("/api/v1/open-finance/consentimento"));
}

export async function definirConsentimento(consentido: boolean) {
  return json<StatusConsentimentoDto>(
    await fetch("/api/v1/open-finance/consentimento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consentido }),
    }),
  );
}

export async function sincronizarOpenFinance() {
  return json<{ transacoesImportadas: number }>(await fetch("/api/v1/open-finance/sincronizar", { method: "POST" }));
}
