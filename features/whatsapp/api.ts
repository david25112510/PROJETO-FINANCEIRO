import type { ApiResponse } from "@/lib/api-response";

export type StatusWhatsappDto = {
  vinculado: boolean;
  verificado: boolean;
  numero: string | null;
};

export type IniciarVinculoDto = {
  numero: string;
  codigo: string;
  expiraEm: string;
};

async function json<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json();
}

export async function buscarStatusWhatsapp() {
  return json<StatusWhatsappDto>(await fetch("/api/v1/whatsapp/status"));
}

export async function iniciarVinculoWhatsapp(numero: string) {
  return json<IniciarVinculoDto>(
    await fetch("/api/v1/whatsapp/vincular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero }),
    }),
  );
}

export async function desvincularWhatsapp() {
  return json<null>(await fetch("/api/v1/whatsapp/vincular", { method: "DELETE" }));
}
