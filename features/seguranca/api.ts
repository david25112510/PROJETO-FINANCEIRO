import type { ApiResponse } from "@/lib/api-response";

export type IniciarTotpDto = {
  secret: string;
  otpauthUri: string;
  qrCodeDataUrl: string;
};

export type ConfirmarTotpDto = {
  codigosBackup: string[];
};

export type SessaoDto = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  atual: boolean;
};

async function json<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json();
}

export async function iniciarAtivacaoTotp() {
  return json<IniciarTotpDto>(await fetch("/api/v1/auth/2fa/iniciar", { method: "POST" }));
}

export async function confirmarAtivacaoTotp(codigo: string) {
  return json<ConfirmarTotpDto>(
    await fetch("/api/v1/auth/2fa/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo }),
    }),
  );
}

export async function desativarTotp(senha: string) {
  return json<null>(
    await fetch("/api/v1/auth/2fa/desativar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    }),
  );
}

export async function listarSessoes() {
  return json<SessaoDto[]>(await fetch("/api/v1/auth/sessoes"));
}

export async function revogarSessao(id: string) {
  return json<null>(await fetch(`/api/v1/auth/sessoes/${id}`, { method: "DELETE" }));
}

export async function trocarSenha(senhaAtual: string, novaSenha: string) {
  return json<null>(
    await fetch("/api/v1/auth/trocar-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    }),
  );
}
